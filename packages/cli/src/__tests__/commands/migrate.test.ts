import path from "node:path";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	findWranglerConfig,
	maybeMigrateWranglerProject,
} from "../../lib/wrangler-migration.js";
import { runCf } from "../helpers/run-cf.js";

const { migrateWranglerToCf } = vi.hoisted(() => ({
	migrateWranglerToCf: vi.fn(),
}));

vi.mock("@cloudflare/codemods", () => ({
	migrateWranglerToCf,
}));

describe("cf migrate", () => {
	runInTempDir();

	const std = mockConsoleMethods();

	beforeEach(() => {
		migrateWranglerToCf.mockReset();
		migrateWranglerToCf.mockResolvedValue({
			changedFiles: ["cloudflare.config.ts"],
			followUps: [],
			status: "complete",
		});
	});

	it.each([
		["wrangler.json", "{}"],
		["wrangler.jsonc", "{}"],
		["wrangler.toml", "name = 'worker'"],
	])("discovers %s and runs the migration", async (configFile, contents) => {
		await seed({ [configFile]: contents });

		const result = await runCf(["migrate"]);

		expect(result.exitCode).toBe(0);
		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), configFile),
			{
				bundler: "wrangler",
				dryRun: false,
				force: false,
				installDependencies: true,
			}
		);
		expect(std.out).toContain(
			"Using the Wrangler bundler because @cloudflare/vite-plugin is not declared."
		);
		expect(std.out).toContain("Updated 1 file(s):");
		expect(std.out).toContain("cloudflare.config.ts");
		expect(std.out).toContain("Migration complete.");
	});

	it.each(["dependencies", "devDependencies"])(
		"selects Vite when @cloudflare/vite-plugin is declared in %s",
		async (dependencyField) => {
			await seed({
				"package.json": JSON.stringify({
					[dependencyField]: { "@cloudflare/vite-plugin": "^1.60.2" },
				}),
				"wrangler.jsonc": "{}",
			});

			await runCf(["migrate"]);

			expect(migrateWranglerToCf).toHaveBeenCalledWith(
				path.join(process.cwd(), "wrangler.jsonc"),
				expect.objectContaining({ bundler: "vite" })
			);
			expect(std.out).toContain(
				"Using the Vite bundler because @cloudflare/vite-plugin is declared."
			);
		}
	);

	it("detects the bundler from the Wrangler config directory", async () => {
		await seed({
			"config/package.json": JSON.stringify({
				devDependencies: { "@cloudflare/vite-plugin": "^1.60.2" },
			}),
			"config/wrangler.toml": "name = 'worker'",
		});

		await runCf(["migrate", "config/wrangler.toml"]);

		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "config/wrangler.toml"),
			expect.objectContaining({ bundler: "vite" })
		);
		expect(std.out).toContain(
			"Using the Vite bundler because @cloudflare/vite-plugin is declared."
		);
	});

	it("keeps an explicit bundler without printing detection output", async () => {
		await seed({ "wrangler.json": "{}" });

		await runCf(["migrate", "--bundler", "vite"]);

		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "wrangler.json"),
			expect.objectContaining({ bundler: "vite" })
		);
		expect(std.out).not.toContain("Using the");
	});

	it("accepts an explicit config path and migration options", async () => {
		await seed({ "config/wrangler.toml": "name = 'worker'" });
		migrateWranglerToCf.mockResolvedValue({
			changedFiles: ["cloudflare.config.ts", "package.json"],
			followUps: [],
			status: "complete",
		});

		await runCf([
			"migrate",
			"config/wrangler.toml",
			"--bundler",
			"wrangler",
			"--dry-run",
			"--force",
			"--no-install",
		]);

		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "config/wrangler.toml"),
			{
				bundler: "wrangler",
				dryRun: true,
				force: true,
				installDependencies: false,
			}
		);
		expect(std.out).toContain(
			`Would update 2 file(s):\n├─ ${path.join("config", "cloudflare.config.ts")}\n└─ ${path.join("config", "package.json")}`
		);
		expect(std.out).toContain("Migration preview complete.");
	});

	it("requires an explicit path when no Wrangler config is found", async () => {
		await expect(runCf(["migrate"])).rejects.toThrow(
			`No Wrangler config found in ${process.cwd()}. Pass its path to cf migrate.`
		);
		expect(migrateWranglerToCf).not.toHaveBeenCalled();
	});

	it("requires an explicit path when multiple Wrangler configs are found", async () => {
		await seed({
			"wrangler.json": "{}",
			"wrangler.toml": "name = 'worker'",
		});

		await expect(runCf(["migrate"])).rejects.toThrow(
			`Multiple Wrangler configs found in ${process.cwd()}. Pass the exact path to cf migrate.`
		);
		expect(migrateWranglerToCf).not.toHaveBeenCalled();
	});

	it("offers to run the same migration for project workflows", async () => {
		await seed({ "wrangler.jsonc": "{}" });
		const confirmMigration = vi.fn().mockResolvedValue(true);

		await expect(
			maybeMigrateWranglerProject(process.cwd(), confirmMigration)
		).resolves.toBe(true);

		expect(confirmMigration).toHaveBeenCalledWith(
			expect.stringContaining("wrangler.jsonc"),
			{
				defaultValue: true,
				fallbackValue: false,
			}
		);
		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "wrangler.jsonc"),
			{
				bundler: "wrangler",
				dryRun: false,
				force: false,
				installDependencies: true,
			}
		);
	});

	it("uses Vite for automatic migration when the plugin is declared", async () => {
		await seed({
			"config/package.json": JSON.stringify({
				devDependencies: { "@cloudflare/vite-plugin": "^1.60.2" },
			}),
			"config/wrangler.jsonc": "{}",
		});
		const confirmMigration = vi.fn().mockResolvedValue(true);

		await expect(
			maybeMigrateWranglerProject(
				path.join(process.cwd(), "config"),
				confirmMigration
			)
		).resolves.toBe(true);

		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "config", "wrangler.jsonc"),
			expect.objectContaining({ bundler: "vite" })
		);
	});

	it("continues without migrating when the project workflow offer is declined", async () => {
		await seed({ "wrangler.toml": "name = 'worker'" });
		const confirmMigration = vi.fn().mockResolvedValue(false);

		await expect(
			maybeMigrateWranglerProject(process.cwd(), confirmMigration)
		).resolves.toBe(false);

		expect(migrateWranglerToCf).not.toHaveBeenCalled();
	});

	it("does not offer migration when a project has no Wrangler config", async () => {
		const confirmMigration = vi.fn();

		await expect(
			maybeMigrateWranglerProject(process.cwd(), confirmMigration)
		).resolves.toBe(false);

		expect(confirmMigration).not.toHaveBeenCalled();
		expect(migrateWranglerToCf).not.toHaveBeenCalled();
	});

	it("does not offer automatic migration when multiple configs are found", async () => {
		await seed({
			"wrangler.json": "{}",
			"wrangler.toml": "name = 'worker'",
		});
		const confirmMigration = vi.fn();

		await expect(findWranglerConfig(process.cwd())).rejects.toThrow(
			`Multiple Wrangler configs found in ${process.cwd()}. Pass the exact path to cf migrate.`
		);
		await expect(
			maybeMigrateWranglerProject(process.cwd(), confirmMigration)
		).resolves.toBe(false);

		expect(confirmMigration).not.toHaveBeenCalled();
		expect(migrateWranglerToCf).not.toHaveBeenCalled();
	});

	it("prints follow-up work and exits unsuccessfully when required", async () => {
		await seed({ "wrangler.json": "{}" });

		migrateWranglerToCf.mockResolvedValue({
			changedFiles: ["cloudflare.config.ts"],
			followUps: [
				{
					blocking: true,
					code: "manual-migration",
					docsUrl: "https://developers.cloudflare.com/workers/",
					message: "Migrate this setting manually.",
					sourcePath: "durable_objects.migrations",
				},
			],
			status: "needs-intervention",
		});

		const result = await runCf(["migrate"]);

		expect(result.exitCode).toBe(1);
		expect(std.out).toContain(
			"Follow-up work:\n└─ [required] durable_objects.migrations: Migrate this setting manually.\n   └─ https://developers.cloudflare.com/workers/"
		);
		expect(std.out).toContain("Migration requires follow-up work.");
	});
});
