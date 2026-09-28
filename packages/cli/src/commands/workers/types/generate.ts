import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { CLOUDFLARE_CONFIG_FILENAME } from "#lib/project-settings.js";
import { generateTypes, loadAndParseConfig } from "@cloudflare/config";
import {
	generateRuntimeTypes,
	RUNTIME_TYPES_MARKER,
} from "@cloudflare/runtime-types";

export const TYPES_OUTPUT_PATH = path.join(
	".cloudflare",
	"types",
	"index.d.ts"
);

export interface GenerateWorkerTypesOptions {
	configPath: string;
	mode: string | undefined;
	includeRuntime: boolean;
}

function formatConfigIssues(
	issues: { path: PropertyKey[]; message: string }[]
) {
	return issues
		.map((issue) => {
			const issuePath = issue.path
				.filter((segment) => typeof segment !== "symbol")
				.join(".");
			return `  - ${issuePath ? `${issuePath}: ` : ""}${issue.message}`;
		})
		.join("\n");
}

function importPath(fromDirectory: string, target: string): string {
	const relativePath = path
		.relative(fromDirectory, target)
		.split(path.sep)
		.join("/");
	return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

/**
 * Writes `.cloudflare/types/index.d.ts` next to `configPath` and returns its
 * absolute path. Shared by `cf workers types` and the `cf init` scaffold.
 */
export async function generateWorkerTypes(
	options: GenerateWorkerTypesOptions
): Promise<string> {
	const { configPath } = options;
	const loaded = await loadAndParseConfig(configPath, {
		isPreview: false,
		mode: options.mode,
	});
	if (!loaded.result.success) {
		throw new Error(
			`Invalid ${CLOUDFLARE_CONFIG_FILENAME}:\n${formatConfigIssues(loaded.result.error.issues)}`
		);
	}

	const worker = loaded.result.data.worker;
	if (worker === undefined) {
		throw new Error(
			`${CLOUDFLARE_CONFIG_FILENAME} must define a Worker to generate types.`
		);
	}

	const projectRoot = path.dirname(configPath);
	const outputPath = path.join(projectRoot, TYPES_OUTPUT_PATH);
	let existingContent: string | undefined;
	try {
		existingContent = await fsp.readFile(outputPath, "utf8");
	} catch {
		// The output does not exist yet.
	}

	let content = generateTypes({
		configPath: importPath(path.dirname(outputPath), configPath),
		packageName: "cf/config",
	});
	if (options.includeRuntime) {
		const { runtimeHeader, runtimeTypes } = await generateRuntimeTypes({
			compatibilityDate: worker.compatibilityDate,
			compatibilityFlags: worker.compatibilityFlags ?? [],
			existingContent,
		});
		content += `\n${runtimeHeader}\n${RUNTIME_TYPES_MARKER}\n${runtimeTypes}`;
	}

	if (existingContent !== content) {
		await fsp.mkdir(path.dirname(outputPath), { recursive: true });
		await fsp.writeFile(outputPath, content);
	}
	return outputPath;
}
