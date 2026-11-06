import { statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { ParsedInputSettingsConfig } from "@cloudflare/config";

export const CLOUDFLARE_CONFIG_FILENAME = "cloudflare.config.ts";

// TODO: Replace this with Zod's built in formatting.
export function formatConfigIssues(
	issues: readonly { path: readonly PropertyKey[]; message: string }[]
): string {
	return issues
		.map((issue) => {
			const issuePath = issue.path
				.filter((segment) => typeof segment !== "symbol")
				.join(".");
			return `  - ${issuePath ? `${issuePath}: ` : ""}${issue.message}`;
		})
		.join("\n");
}

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

	const { loadAndParseConfigSettings } = await import("@cloudflare/config");
	const loaded = await loadAndParseConfigSettings(configPath, {
		isPreview,
		mode: projectConfigMode,
	});
	if (!loaded.result.success) {
		throw new Error(
			`Invalid ${CLOUDFLARE_CONFIG_FILENAME}:\n${formatConfigIssues(loaded.result.error.issues)}`
		);
	}

	const result: LoadedProjectSettings = {
		path: configPath,
		settings: loaded.result.data,
	};
	loadedSettings = { startDir: resolvedStartDir, isPreview, result };
	return result;
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
