import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import {
	clearLoadedProjectSettings,
	findCloudflareConfig,
	loadProjectSettings,
	setProjectConfigMode,
} from "../../lib/project-settings.js";

describe("project settings", () => {
	runInTempDir();

	beforeEach(() => {
		clearLoadedProjectSettings();
	});

	it("finds the nearest cloudflare.config.ts from a nested directory", () => {
		const rootConfig = join(process.cwd(), "cloudflare.config.ts");
		writeFileSync(rootConfig, "export default {};");
		const nested = join(process.cwd(), "one", "two");
		mkdirSync(nested, { recursive: true });

		expect(findCloudflareConfig(nested)).toBe(rootConfig);
	});

	it("ignores a directory named cloudflare.config.ts", () => {
		const rootConfig = join(process.cwd(), "cloudflare.config.ts");
		writeFileSync(rootConfig, "export default {};");
		const nested = join(process.cwd(), "one", "two");
		mkdirSync(join(nested, "cloudflare.config.ts"), { recursive: true });

		expect(findCloudflareConfig(nested)).toBe(rootConfig);
	});

	it("loads account settings without resolving resource config", async () => {
		const configPath = join(process.cwd(), "cloudflare.config.ts");
		writeFileSync(
			configPath,
			`export default {
	accountId: "account-1",
	complianceRegion: "fedramp-high",
	worker: () => { throw new Error("worker config should stay lazy"); },
	containers: [() => { throw new Error("container config should stay lazy"); }],
};`
		);

		await expect(loadProjectSettings()).resolves.toEqual({
			path: configPath,
			settings: {
				accountId: "account-1",
				complianceRegion: "fedramp-high",
			},
		});
	});

	it("passes the selected mode to function-form settings", async () => {
		const configPath = join(process.cwd(), "cloudflare.config.ts");
		writeFileSync(
			configPath,
			`export default ({ mode }) => ({
	accountId: mode,
});`
		);
		setProjectConfigMode("staging");

		await expect(loadProjectSettings()).resolves.toEqual({
			path: configPath,
			settings: {
				accountId: "staging",
			},
		});
	});

	it("passes Preview context to function-form settings", async () => {
		const configPath = join(process.cwd(), "cloudflare.config.ts");
		writeFileSync(
			configPath,
			`export default ({ isPreview }) => ({
	accountId: isPreview ? "preview-account" : "production-account",
	complianceRegion: isPreview ? "fedramp-high" : "public",
});`
		);

		await expect(
			loadProjectSettings(undefined, { isPreview: true })
		).resolves.toEqual({
			path: configPath,
			settings: {
				accountId: "preview-account",
				complianceRegion: "fedramp-high",
			},
		});
	});

	it("surfaces settings validation errors", async () => {
		writeFileSync(
			join(process.cwd(), "cloudflare.config.ts"),
			`export default {
	accountId: 42,
};`
		);

		await expect(loadProjectSettings()).rejects.toThrow();
	});
});
