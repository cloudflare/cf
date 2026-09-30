import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { generateResourceIndexFile } from "../../../generator/emit/index-files.js";
import {
	handWrittenLeafCommands,
	readHandWrittenLeafCommandMeta,
} from "../../../generator/hand-written-overrides.js";
import { runCf } from "../helpers/run-cf.js";

describe("cf pages deploy", () => {
	runInTempDir();

	const std = mockConsoleMethods();

	beforeEach(() => {
		vi.stubEnv("WRANGLER_CACHE_DIR", undefined);
	});

	it("directs an existing Pages project to Wrangler", async () => {
		mkdirSync(".wrangler/cache", { recursive: true });
		writeFileSync(".wrangler/cache/pages.json", "{}");

		const { exitCode } = await runCf(["pages", "deploy", "dist"]);

		expect(exitCode).toBe(1);
		expect(std.err).toContain("Legacy Pages is not supported in `cf`");
		expect(std.err).toContain("wrangler pages deploy");
		expect(std.err).not.toContain("`cf deploy`");
	});

	it("directs a new Pages project to cf deploy", async () => {
		const { exitCode } = await runCf(["pages", "deploy"]);

		expect(exitCode).toBe(1);
		expect(std.err).toContain("Pages on Workers");
		expect(std.err).toContain("`cf deploy`");
		expect(std.err).not.toContain("wrangler pages deploy");
	});

	it("describes a Pages deployment in help", async () => {
		const { exitCode } = await runCf(["pages", "deploy", "--help"]);

		expect(exitCode).toBe(0);
		expect(std.out).toContain(
			"Deploy a directory of static assets as a Pages deployment"
		);
	});

	it("honors Wrangler's cache directory override", async () => {
		const cacheDirectory = join(process.cwd(), "wrangler-cache");
		mkdirSync(cacheDirectory);
		writeFileSync(join(cacheDirectory, "pages.json"), "{}");
		vi.stubEnv("WRANGLER_CACHE_DIR", cacheDirectory);

		const { exitCode } = await runCf(["pages", "deploy"]);

		expect(exitCode).toBe(1);
		expect(std.err).toContain("wrangler pages deploy");
	});

	it("recognizes the node_modules cache", async () => {
		mkdirSync("node_modules/.cache/wrangler", { recursive: true });
		writeFileSync("node_modules/.cache/wrangler/pages.json", "{}");

		const { exitCode } = await runCf(["pages", "deploy"]);

		expect(exitCode).toBe(1);
		expect(std.err).toContain("wrangler pages deploy");
	});
});

describe("pages deploy hand-written leaf", () => {
	it("is registered against the pages product", () => {
		expect(handWrittenLeafCommands("pages")).toContainEqual({
			kind: "leaf",
			dryRun: "preview",
			parent: "pages",
			name: "deploy",
			dir: "pages/deploy",
		});
	});

	it("fails clearly if the spec adds a deploy command", () => {
		const schema = {
			name: "pages",
			description: "Pages",
		} as Parameters<typeof generateResourceIndexFile>[0];

		expect(() => generateResourceIndexFile(schema, ["deploy"], [])).toThrow(
			'Hand-written leaf command "pages deploy" collides with a command or group of the same name in the spec.'
		);
	});

	it("keeps metadata aligned with the command", () => {
		const registered = handWrittenLeafCommands("pages").find(
			(command) => command.name === "deploy"
		);
		if (registered === undefined) {
			throw new Error("pages deploy is not registered");
		}
		const meta = readHandWrittenLeafCommandMeta("pages", registered);

		expect(meta.command).toBe("cf pages deploy");
		expect(meta.description).toBe(
			"Deploy a directory of static assets as a Pages deployment."
		);
		expect(meta.fullPath).toEqual(["pages", "deploy"]);
		expect(meta.arguments).toEqual([
			expect.objectContaining({
				name: "directory",
				position: 0,
				type: "string",
				required: false,
			}),
		]);
		expect(meta.options).toEqual([
			expect.objectContaining({ name: "dry-run", type: "boolean" }),
		]);
		expect(meta.operationId).toBeUndefined();
	});
});
