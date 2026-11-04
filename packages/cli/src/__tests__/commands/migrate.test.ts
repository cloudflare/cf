import { readFileSync } from "node:fs";
import path from "node:path";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	findWranglerConfig,
	maybeMigrateWranglerProject,
} from "../../lib/wrangler-migration.js";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

const { migrateWranglerToCf } = vi.hoisted(() => ({
	migrateWranglerToCf: vi.fn(),
}));

vi.mock("@cloudflare/codemods", () => ({
	migrateWranglerToCf,
}));

describe("cf migrate", () => {
	runInTempDir();

	const std = mockOutputStreams();

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
		expect(std.out).toBe("");
		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), configFile),
			{
				bundler: "wrangler",
				dryRun: false,
				force: false,
				installDependencies: true,
			}
		);
		expect(std.err).toContain(
			"Using the Wrangler bundler because @cloudflare/vite-plugin is not declared."
		);
		expect(std.err).toContain("Updated 1 file(s):");
		expect(std.err).toContain("cloudflare.config.ts");
		expect(std.err).toContain("Migration complete.");
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

		expect(migrateWranglerToCf).toHaveBeenCalledWith(
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

		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "wrangler.json"),
			expect.objectContaining({ bundler: "vite" })
		);
		expect(std.err).not.toContain("Using the");
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
		expect(std.out).toBe("");
		expect(std.err).toContain(
			"Would update 2 file(s):\n├─ config/cloudflare.config.ts\n└─ config/package.json"
		);
		expect(std.err).toContain("Migration preview complete.");
	});

	it("approves the builds cf needs in the active pnpm-workspace.yaml before installing", async () => {
		await seed({
			"package.json": JSON.stringify({
				name: "cf-migrate-pnpm-repro",
				private: true,
				packageManager: "pnpm@12.16.1",
			}),
			"pnpm-workspace.yaml": "packages:\n  - apps/*\nallowBuilds:\n  esbuild: true\n",
			"apps/worker/package.json": JSON.stringify({
				name: "worker",
				private: true,
				type: "module",
			}),
			"apps/worker/wrangler.jsonc": JSON.stringify({
				name: "worker",
				main: "src/index.js",
				compatibility_date: "2026-11-01",
			}),
		});
		let workspaceYamlAtInstall: string | undefined;
		migrateWranglerToCf.mockImplementation(async () => {
			workspaceYamlAtInstall = readFileSync("pnpm-workspace.yaml", "utf8");
			return {
				changedFiles: ["cloudflare.config.ts", "package.json"],
				followUps: [],
				status: "complete",
			};
		});

		const result = await runCf(["migrate", "apps/worker/wrangler.jsonc"]);

		expect(result.exitCode).toBe(0);
		const workspaceYaml = readFileSync("pnpm-workspace.yaml", "utf8");
		expect(workspaceYaml).toContain("packages:");
		expect(workspaceYaml).toContain("esbuild: true");
		expect(workspaceYaml).toContain("workerd: true");
		expect(workspaceYamlAtInstall).toContain("workerd: true");
		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "apps/worker/wrangler.jsonc"),
			expect.objectContaining({ installDependencies: true })
		);
	});

	it("keeps an explicit decision not to approve workerd and skips the install", async () => {
		await seed({
			"package.json": JSON.stringify({
				name: "cf-migrate-pnpm-repro",
				private: true,
				packageManager: "pnpm@12.16.1",
			}),
			"pnpm-workspace.yaml": "packages:\n  - apps/*\nallowBuilds:\n  workerd: false\n",
			"apps/worker/wrangler.jsonc": "{}",
		});

		const result = await runCf(["migrate", "apps/worker/wrangler.jsonc"]);

		expect(result.exitCode).toBe(0);
		expect(readFileSync("pnpm-workspace.yaml", "utf8")).toBe(
			"packages:\n  - apps/*\nallowBuilds:\n  workerd: false\n"
		);
		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "apps/worker/wrangler.jsonc"),
			expect.objectContaining({ installDependencies: false })
		);
		expect(std.err).toContain("workerd");
	});

	it("writes no build approvals on --dry-run", async () => {
		await seed({
			"package.json": JSON.stringify({
				name: "cf-migrate-pnpm-repro",
				private: true,
				packageManager: "pnpm@12.16.1",
			}),
			"pnpm-workspace.yaml": "packages:\n  - apps/*\n",
			"apps/worker/wrangler.jsonc": "{}",
		});

		await runCf(["migrate", "apps/worker/wrangler.jsonc", "--dry-run"]);

		expect(readFileSync("pnpm-workspace.yaml", "utf8")).toBe(
			"packages:\n  - apps/*\n"
		);
	});

	it("writes no build approvals when the install is skipped", async () => {
		await seed({
			"package.json": JSON.stringify({
				name: "cf-migrate-pnpm-repro",
				private: true,
				packageManager: "pnpm@12.16.1",
			}),
			"pnpm-workspace.yaml": "packages:\n  - apps/*\n",
			"apps/worker/wrangler.jsonc": "{}",
		});

		await runCf(["migrate", "apps/worker/wrangler.jsonc", "--no-install"]);

		expect(readFileSync("pnpm-workspace.yaml", "utf8")).toBe(
			"packages:\n  - apps/*\n"
		);
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

		expect(migrateWranglerToCf).toHaveBeenCalledWith(
			path.join(process.cwd(), "wrangler.jsonc"),
			{
				bundler: "wrangler",
				dryRun: true,
				force: false,
				installDependencies: true,
			}
		);
		expect(migrateWranglerToCf).toHaveBeenCalledOnce();
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
		expect(std.out).toBe("");
		expect(std.err).toContain(
			"Follow-up work:\n└─ [required] durable_objects.migrations: Migrate this setting manually.\n   └─ https://developers.cloudflare.com/workers/"
		);
		expect(std.err).toContain("Migration requires follow-up work.");
	});
});
