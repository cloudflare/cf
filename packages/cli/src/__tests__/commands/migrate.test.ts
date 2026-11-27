import path from "node:path";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	findWranglerConfig,
	maybeMigrateWranglerProject,
} from "../../lib/wrangler-migration.js";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";
import type * as AutoConfigAdapter from "../../lib/autoconfig.js";
import type * as AutoConfig from "@cloudflare/autoconfig";

const mocks = vi.hoisted(() => ({
	analyzeProject: vi.fn(),
	configureProject: vi.fn(),
	migrateBundler: vi.fn(),
	migrateWranglerConfig: vi.fn(),
}));

vi.mock("@cloudflare/autoconfig", async (importOriginal) => ({
	...(await importOriginal<typeof AutoConfig>()),
	migrateBundler: mocks.migrateBundler,
	migrateWranglerConfig: mocks.migrateWranglerConfig,
}));

vi.mock("../../lib/autoconfig.js", async (importOriginal) => ({
	...(await importOriginal<typeof AutoConfigAdapter>()),
	analyzeProject: mocks.analyzeProject,
	configureProject: mocks.configureProject,
}));

const migrationResult = {
	changedFiles: [],
	followUps: [],
	requiresInstall: false,
	status: "complete",
};

describe("cf migrate", () => {
	runInTempDir();

	const std = mockOutputStreams();

	beforeEach(() => {
		for (const mock of Object.values(mocks)) {
			mock.mockReset();
		}
		mocks.analyzeProject.mockResolvedValue(undefined);
		mocks.migrateWranglerConfig.mockResolvedValue({
			...migrationResult,
			changedFiles: ["cloudflare.config.ts"],
		});
		mocks.migrateBundler.mockResolvedValue(migrationResult);
	});

	it.each([
		["wrangler.json", "{}"],
		["wrangler.jsonc", "{}"],
		["wrangler.toml", "name = 'worker'"],
	])("discovers %s and runs the migration", async (configFile, contents) => {
		await seed({ [configFile]: contents });

		const result = await runCf(["migrate"]);

		expect(result.exitCode).toBe(0);
		expect(std.out).toBe("");
		expect(mocks.migrateWranglerConfig).toHaveBeenCalledWith(
			path.join(process.cwd(), configFile),
			{ dryRun: false, force: false }
		);
		expect(mocks.migrateBundler).toHaveBeenCalledWith(
			path.join(process.cwd(), configFile),
			{ bundler: "wrangler", dryRun: false, installDependencies: true }
		);
		expect(std.err).toContain(
			"Using the Wrangler bundler because @cloudflare/vite-plugin is not declared."
		);
		expect(std.err).toContain("Updated 1 file(s):");
		expect(std.err).toContain("cloudflare.config.ts");
		expect(std.err).toContain("Migration complete.");
	});

	it.each([
		"dependencies",
		"devDependencies",
		"peerDependencies",
		"optionalDependencies",
	])(
		"selects Vite when @cloudflare/vite-plugin is declared in %s",
		async (dependencyField) => {
			await seed({
				"package.json": JSON.stringify({
					[dependencyField]: { "@cloudflare/vite-plugin": "^1.60.2" },
				}),
				"wrangler.jsonc": "{}",
			});

			await runCf(["migrate"]);

			expect(mocks.migrateBundler).toHaveBeenCalledWith(
				path.join(process.cwd(), "wrangler.jsonc"),
				expect.objectContaining({ bundler: "vite" })
			);
			expect(std.err).toContain(
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

		expect(mocks.migrateBundler).toHaveBeenCalledWith(
			path.join(process.cwd(), "config/wrangler.toml"),
			expect.objectContaining({ bundler: "vite" })
		);
		expect(std.err).toContain(
			"Using the Vite bundler because @cloudflare/vite-plugin is declared."
		);
	});

	it("keeps an explicit bundler without printing detection output", async () => {
		await seed({ "wrangler.json": "{}" });

		await runCf(["migrate", "--bundler", "vite"]);

		expect(mocks.migrateBundler).toHaveBeenCalledWith(
			path.join(process.cwd(), "wrangler.json"),
			expect.objectContaining({ bundler: "vite" })
		);
		expect(std.err).not.toContain("Using the");
	});

	it("accepts an explicit config path and migration options", async () => {
		await seed({ "config/wrangler.toml": "name = 'worker'" });
		mocks.migrateBundler.mockResolvedValue({
			...migrationResult,
			changedFiles: ["package.json"],
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

		expect(mocks.migrateWranglerConfig).toHaveBeenCalledWith(
			path.join(process.cwd(), "config/wrangler.toml"),
			{ dryRun: true, force: true }
		);
		expect(mocks.migrateBundler).toHaveBeenCalledWith(
			path.join(process.cwd(), "config/wrangler.toml"),
			{ bundler: "wrangler", dryRun: true, installDependencies: false }
		);
		// Framework setup installs packages, so --no-install skips it
		expect(mocks.configureProject).not.toHaveBeenCalled();
		expect(std.out).toBe("");
		expect(std.err).toContain(
			"Would update 2 file(s):\n├─ config/cloudflare.config.ts\n└─ config/package.json"
		);
		expect(std.err).toContain("Migration preview complete.");
	});

	it("detects the project first and uses the bundler its framework setup chooses", async () => {
		await seed({ "wrangler.json": "{}" });
		const details = {
			configured: false,
			framework: { id: "astro", name: "Astro" },
			outputDir: "dist",
		};
		mocks.analyzeProject.mockResolvedValue(details);
		mocks.configureProject.mockResolvedValue({ buildTool: "vite" });

		await runCf(["migrate", "--bundler", "wrangler"]);

		const configPath = path.join(process.cwd(), "wrangler.json");
		expect(mocks.analyzeProject).toHaveBeenCalledWith(process.cwd(), {
			output: "stderr",
			wranglerConfigPath: configPath,
		});
		expect(mocks.analyzeProject.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.migrateWranglerConfig.mock.invocationCallOrder[0] ?? 0
		);
		expect(mocks.configureProject).toHaveBeenCalledWith(details, {
			dryRun: false,
			output: "stderr",
		});
		// Vite deploys the build output, so the migration doesn't ask about an assets directory there
		expect(mocks.migrateBundler).toHaveBeenCalledWith(
			configPath,
			expect.objectContaining({ bundler: "vite", outputDir: "dist" })
		);
		expect(std.err).toContain(
			"Using the Vite bundler instead of --bundler wrangler, because Astro builds with it."
		);
	});

	it("requires an explicit path when no Wrangler config is found", async () => {
		await expect(runCf(["migrate"])).rejects.toThrow(
			`No Wrangler config found in ${process.cwd()}. Pass its path to cf migrate.`
		);
		expect(mocks.migrateWranglerConfig).not.toHaveBeenCalled();
	});

	it("requires an explicit path when multiple Wrangler configs are found", async () => {
		await seed({
			"wrangler.json": "{}",
			"wrangler.toml": "name = 'worker'",
		});

		await expect(runCf(["migrate"])).rejects.toThrow(
			`Multiple Wrangler configs found in ${process.cwd()}. Pass the exact path to cf migrate`
		);
		expect(mocks.migrateWranglerConfig).not.toHaveBeenCalled();
	});

	it("offers to convert a Wrangler config before project setup", async () => {
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
		expect(mocks.migrateBundler).toHaveBeenCalledWith(
			path.join(process.cwd(), "wrangler.jsonc"),
			{ bundler: "wrangler", dryRun: false, installDependencies: true }
		);
	});

	it("dry-runs an accepted Wrangler config conversion before project setup", async () => {
		await seed({ "wrangler.jsonc": "{}" });
		const confirmMigration = vi.fn().mockResolvedValue(true);

		await expect(
			maybeMigrateWranglerProject(
				process.cwd(),
				confirmMigration,
				"stderr",
				true
			)
		).resolves.toBe(true);

		expect(mocks.migrateBundler).toHaveBeenCalledWith(
			path.join(process.cwd(), "wrangler.jsonc"),
			{ bundler: "wrangler", dryRun: true, installDependencies: true }
		);
		expect(mocks.migrateBundler).toHaveBeenCalledOnce();
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

		expect(mocks.migrateBundler).toHaveBeenCalledWith(
			path.join(process.cwd(), "config", "wrangler.jsonc"),
			expect.objectContaining({ bundler: "vite" })
		);
	});

	it("stops when the project workflow offer is declined", async () => {
		await seed({ "wrangler.toml": "name = 'worker'" });
		const confirmMigration = vi.fn().mockResolvedValue(false);

		await expect(
			maybeMigrateWranglerProject(process.cwd(), confirmMigration)
		).rejects.toThrow("cf migrate wrangler.toml");

		expect(mocks.migrateWranglerConfig).not.toHaveBeenCalled();
	});

	it("does not offer migration when a project has no Wrangler config", async () => {
		const confirmMigration = vi.fn();

		await expect(
			maybeMigrateWranglerProject(process.cwd(), confirmMigration)
		).resolves.toBe(false);

		expect(confirmMigration).not.toHaveBeenCalled();
		expect(mocks.migrateWranglerConfig).not.toHaveBeenCalled();
	});

	it("does not offer automatic migration when multiple configs are found", async () => {
		await seed({
			"wrangler.json": "{}",
			"wrangler.toml": "name = 'worker'",
		});
		const confirmMigration = vi.fn();

		await expect(findWranglerConfig(process.cwd())).rejects.toThrow(
			`Multiple Wrangler configs found in ${process.cwd()}. Pass the exact path to cf migrate`
		);
		await expect(
			maybeMigrateWranglerProject(process.cwd(), confirmMigration)
		).rejects.toThrow("Pass the exact path to cf migrate");

		expect(confirmMigration).not.toHaveBeenCalled();
		expect(mocks.migrateWranglerConfig).not.toHaveBeenCalled();
	});

	it("prints follow-up work and exits unsuccessfully when required", async () => {
		await seed({ "wrangler.json": "{}" });

		mocks.migrateBundler.mockResolvedValue({
			...migrationResult,
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
		expect(std.out).toBe("");
		expect(std.err).toContain(
			"Follow-up work:\n└─ [required] durable_objects.migrations: Migrate this setting manually.\n   └─ https://developers.cloudflare.com/workers/"
		);
		expect(std.err).toContain("Migration requires follow-up work.");
	});
});
