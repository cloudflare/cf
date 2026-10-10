import { randomUUID } from "node:crypto";
import { statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type {
	ConfigContext,
	ParsedInputSettingsConfig,
} from "@cloudflare/config";

export const CLOUDFLARE_CONFIG_FILENAME = "cloudflare.config.ts";

export interface LoadedProjectSettings {
	path: string;
	settings: ParsedInputSettingsConfig | undefined;
}

let loadedSettings:
	| {
			startDir: string;
			isPreview: boolean;
			result: LoadedProjectSettings | null;
	  }
	| undefined;
let projectConfigMode: string | undefined;

/** Set the mode supplied to function-form project configuration exports. */
export function setProjectConfigMode(mode: string | undefined): void {
	projectConfigMode = mode;
	loadedSettings = undefined;
}

export function findCloudflareConfig(startDir = process.cwd()): string | null {
	let dir = resolve(startDir);

	while (true) {
		const configPath = join(dir, CLOUDFLARE_CONFIG_FILENAME);
		try {
			if (statSync(configPath).isFile()) {
				return configPath;
			}
		} catch {
			// Keep searching when the candidate does not exist or cannot be read.
		}

		const parent = dirname(dir);
		if (parent === dir) {
			return null;
		}
		dir = parent;
	}
}

export async function loadProjectSettings(
	startDir = process.cwd(),
	options: { isPreview?: boolean } = {}
): Promise<LoadedProjectSettings | null> {
	const resolvedStartDir = resolve(startDir);
	const isPreview = options.isPreview ?? false;
	loadedSettings = undefined;

	const configPath = findCloudflareConfig(resolvedStartDir);
	if (!configPath) {
		loadedSettings = { startDir: resolvedStartDir, isPreview, result: null };
		return null;
	}

	const context: ConfigContext = { isPreview, mode: projectConfigMode };
	const result: LoadedProjectSettings = isBun()
		? {
				path: configPath,
				settings: await loadSettingsOnBun(configPath, context),
			}
		: await loadSettingsOnNode(configPath, context);
	loadedSettings = { startDir: resolvedStartDir, isPreview, result };
	return result;
}

function isBun(): boolean {
	return typeof process !== "undefined" && process.versions.bun !== undefined;
}

async function loadSettingsOnNode(
	configPath: string,
	context: ConfigContext
): Promise<LoadedProjectSettings> {
	const { loadAndParseConfigSettings } = await import("@cloudflare/config");
	const loaded = await loadAndParseConfigSettings(configPath, context);
	if (!loaded.result.success) {
		throw invalidConfigError(loaded.result.error.issues);
	}
	return {
		path: configPath,
		settings: loaded.result.data,
	};
}

// Bun runs TypeScript directly, so the Node module-hooks loader in
// `@cloudflare/config` (which throws on Bun) is unnecessary there. Import the
// file natively and reuse the same settings validation instead.
async function loadSettingsOnBun(
	configPath: string,
	context: ConfigContext
): Promise<ParsedInputSettingsConfig | undefined> {
	const { resolveAndParseConfigSettings } = await import("@cloudflare/config");
	const url = `${pathToFileURL(configPath).href}?cf-no-cache=${randomUUID()}`;
	const mod = await import(url);
	if (!("default" in mod)) {
		throw new Error(
			`The config file "${configPath}" does not have a default export. Export your configuration with \`export default defineConfig({ ... })\`.`
		);
	}
	const result = await resolveAndParseConfigSettings(mod.default, context);
	if (!result.success) {
		throw invalidConfigError(result.error.issues);
	}

	return result.data;
}

function invalidConfigError(
	issues: { path: (string | number | symbol)[]; message: string }[]
): Error {
	const rendered = issues
		.map((issue) => {
			const path = issue.path
				.filter((segment) => typeof segment !== "symbol")
				.join(".");
			return `  - ${path ? `${path}: ` : ""}${issue.message}`;
		})
		.join("\n");
	return new Error(`Invalid ${CLOUDFLARE_CONFIG_FILENAME}:\n${rendered}`);
}

export function getLoadedProjectSettings(
	startDir = process.cwd(),
	options: { isPreview?: boolean } = {}
): LoadedProjectSettings | null | undefined {
	const resolvedStartDir = resolve(startDir);
	const isPreview = options.isPreview ?? false;
	return loadedSettings?.startDir === resolvedStartDir &&
		loadedSettings.isPreview === isPreview
		? loadedSettings.result
		: undefined;
}

export function clearLoadedProjectSettings(): void {
	loadedSettings = undefined;
	projectConfigMode = undefined;
}
