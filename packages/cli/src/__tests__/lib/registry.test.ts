import { mkdirSync } from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	getCloudflareRegistryEnvironment,
	getCloudflareRegistryPath,
} from "../../lib/registry.js";

describe("getCloudflareRegistryPath", () => {
	runInTempDir();
	let home: string;
	let xdg: string;

	beforeEach(() => {
		home = resolve("test home");
		xdg = resolve("xdg config");
		mkdirSync(home);
		vi.spyOn(os, "homedir").mockReturnValue(home);
		vi.stubEnv("XDG_CONFIG_HOME", xdg);
	});

	afterEach(() => vi.restoreAllMocks());

	it("uses cf's XDG registry when no override is exported", () => {
		expect(getCloudflareRegistryPath({})).toBe(
			join(xdg, "cloudflare", "registry")
		);
	});

	it("keeps cf's default even when legacy Wrangler and Cloudflare directories exist", () => {
		mkdirSync(join(home, ".wrangler", "registry"), { recursive: true });
		mkdirSync(join(home, ".cloudflare", "registry"), { recursive: true });
		expect(getCloudflareRegistryPath({})).toBe(
			join(xdg, "cloudflare", "registry")
		);
	});

	it("uses cf's native config directory when XDG_CONFIG_HOME is unset", () => {
		vi.stubEnv("XDG_CONFIG_HOME", undefined);
		vi.stubEnv("APPDATA", join(home, "AppData", "Roaming"));
		mkdirSync(join(home, ".wrangler"));
		const config =
			process.platform === "darwin"
				? join(home, "Library", "Preferences")
				: process.platform === "win32"
					? join(home, "AppData", "Roaming", "xdg.config")
					: join(home, ".config");
		expect(getCloudflareRegistryPath({})).toBe(
			join(config, "cloudflare", "registry")
		);
	});

	it("uses cf's default when all registry variables are empty", () => {
		expect(
			getCloudflareRegistryPath({
				CLOUDFLARE_REGISTRY_PATH: "",
				WRANGLER_REGISTRY_PATH: "",
				MINIFLARE_REGISTRY_PATH: "",
			})
		).toBe(join(xdg, "cloudflare", "registry"));
	});

	it.each([
		"CLOUDFLARE_REGISTRY_PATH",
		"WRANGLER_REGISTRY_PATH",
		"MINIFLARE_REGISTRY_PATH",
	])("uses the explicitly exported %s", (variable) => {
		mkdirSync(join(home, ".wrangler"));
		for (const configured of [
			"custom registry",
			"../sibling registry",
			resolve("absolute registry"),
		]) {
			expect(getCloudflareRegistryPath({ [variable]: configured })).toBe(
				resolve(configured)
			);
		}
	});

	it("gives CLOUDFLARE_REGISTRY_PATH precedence over compatibility variables", () => {
		expect(
			getCloudflareRegistryPath({
				CLOUDFLARE_REGISTRY_PATH: "cf registry",
				WRANGLER_REGISTRY_PATH: "wrangler registry",
				MINIFLARE_REGISTRY_PATH: "miniflare registry",
			})
		).toBe(resolve("cf registry"));
	});

	it("gives WRANGLER_REGISTRY_PATH precedence over MINIFLARE_REGISTRY_PATH", () => {
		expect(
			getCloudflareRegistryPath({
				CLOUDFLARE_REGISTRY_PATH: "",
				WRANGLER_REGISTRY_PATH: "wrangler registry",
				MINIFLARE_REGISTRY_PATH: "miniflare registry",
			})
		).toBe(resolve("wrangler registry"));
	});

	it("falls through empty compatibility variables", () => {
		expect(
			getCloudflareRegistryPath({
				CLOUDFLARE_REGISTRY_PATH: "",
				WRANGLER_REGISTRY_PATH: "",
				MINIFLARE_REGISTRY_PATH: "miniflare registry",
			})
		).toBe(resolve("miniflare registry"));
	});

	it("passes cf's clean default to all delegate variables", () => {
		mkdirSync(join(home, ".wrangler"));
		const registry = join(xdg, "cloudflare", "registry");
		expect(getCloudflareRegistryEnvironment({})).toEqual({
			CLOUDFLARE_REGISTRY_PATH: registry,
			WRANGLER_REGISTRY_PATH: registry,
			MINIFLARE_REGISTRY_PATH: registry,
		});
	});

	it.each([
		"CLOUDFLARE_REGISTRY_PATH",
		"WRANGLER_REGISTRY_PATH",
		"MINIFLARE_REGISTRY_PATH",
	])("passes an explicit %s to all delegate variables", (variable) => {
		const registry = resolve("custom registry");
		expect(getCloudflareRegistryEnvironment({ [variable]: registry })).toEqual({
			CLOUDFLARE_REGISTRY_PATH: registry,
			WRANGLER_REGISTRY_PATH: registry,
			MINIFLARE_REGISTRY_PATH: registry,
		});
	});

	it("passes the winning override to every delegate variable when they conflict", () => {
		const registry = resolve("cf registry");
		expect(
			getCloudflareRegistryEnvironment({
				CLOUDFLARE_REGISTRY_PATH: registry,
				WRANGLER_REGISTRY_PATH: "wrangler registry",
				MINIFLARE_REGISTRY_PATH: "miniflare registry",
			})
		).toEqual({
			CLOUDFLARE_REGISTRY_PATH: registry,
			WRANGLER_REGISTRY_PATH: registry,
			MINIFLARE_REGISTRY_PATH: registry,
		});
	});
});
