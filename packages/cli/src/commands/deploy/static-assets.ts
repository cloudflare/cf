import * as fsp from "node:fs/promises";
import * as path from "node:path";
import {
	BUILD_OUTPUT_ROOT,
	cleanBuildOutputDir,
	writeAssets,
	writeRootConfig,
	writeWorkerConfig,
} from "@cloudflare/build-output-utils";
import {
	InputSettingsSchema,
	InputWorkerSchema,
	loadAndParseConfig,
} from "@cloudflare/config";
import {
	DEFAULT_COMPAT_DATE,
	getWorkerNameFromProject,
} from "@cloudflare/workers-utils";
import {
	CLOUDFLARE_CONFIG_FILENAME,
	findCloudflareConfig,
	formatConfigIssues,
} from "../../lib/project-settings.js";
import { log } from "../../lib/ui/log.js";
import type {
	ParsedInputSettingsConfig,
	ParsedInputWorkerConfig,
} from "@cloudflare/config";

interface StaticAssetsProjectConfig {
	settings: ParsedInputSettingsConfig | undefined;
	worker: ParsedInputWorkerConfig;
}

interface StaticAssetsCommandArgs {
	directory?: string;
	mode?: string;
	prebuilt?: boolean;
	quiet?: boolean;
	worker?: string;
}

interface StaticAssetsBuildContext {
	isPreview: boolean;
}

export const staticAssetsDirectoryOption = {
	type: "string",
	description:
		"Directory containing prebuilt static assets. Use only for assets-only projects; projects with server-side code require a delegated build.",
} as const;

/** Prepare assets-only Build Output when a deploy-like command receives a directory. */
export async function prepareStaticAssetsBuildOutput(
	argv: StaticAssetsCommandArgs,
	context: StaticAssetsBuildContext
): Promise<boolean> {
	const { directory } = argv;
	if (directory === undefined) {
		return false;
	}
	if (directory === "") {
		throw new Error("The static assets directory argument cannot be empty.");
	}
	if (argv.prebuilt) {
		throw new Error(
			"A static assets directory cannot be combined with --prebuilt. Pass either the source directory or --prebuilt Build Output."
		);
	}
	if (argv.worker) {
		throw new Error(
			"A static assets directory cannot be combined with --worker because the directory form creates a single assets-only Worker."
		);
	}

	const root = await fsp.realpath(process.cwd());
	const sourceDirectory = await resolveSourceDirectory(root, directory);
	const buildOutputDirectory = path.resolve(root, BUILD_OUTPUT_ROOT);

	if (isWithin(buildOutputDirectory, sourceDirectory)) {
		throw new Error(
			`The static assets directory cannot be inside ${BUILD_OUTPUT_ROOT}, because that directory is replaced during deployment. Choose the original build directory instead.`
		);
	}
	if (
		sourceDirectory !== root &&
		isWithin(sourceDirectory, buildOutputDirectory)
	) {
		throw new Error(
			`The static assets directory cannot contain ${BUILD_OUTPUT_ROOT}. Choose the specific directory containing the built assets.`
		);
	}

	const projectConfig = await loadStaticAssetsProjectConfig(root, {
		isPreview: context.isPreview,
		mode: argv.mode,
	});

	if (!argv.quiet) {
		log.section("Static assets");
		log.message(`Preparing an assets-only deployment from ${directory}`);
	}

	await cleanBuildOutputDir(root);
	await writeRootConfig(root, projectConfig.settings, {
		isPreview: context.isPreview,
		mode: argv.mode,
	});
	await writeWorkerConfig({ root, config: projectConfig.worker });
	await writeAssets({ root, sourceDirectory });

	if (!argv.quiet) {
		log.success(`Build Output written to ${BUILD_OUTPUT_ROOT}`);
		log.message("");
	}
	return true;
}

async function loadStaticAssetsProjectConfig(
	root: string,
	context: StaticAssetsBuildContext & { mode?: string }
): Promise<StaticAssetsProjectConfig> {
	const configPath = findCloudflareConfig(root);
	if (configPath === null) {
		return {
			settings: undefined,
			worker: createDefaultWorkerConfig(root),
		};
	}

	const loaded = await loadAndParseConfig(configPath, {
		isPreview: context.isPreview,
		mode: context.mode,
	});
	if (!loaded.result.success) {
		throw new Error(
			`Invalid ${CLOUDFLARE_CONFIG_FILENAME}:\n${formatConfigIssues(loaded.result.error.issues)}`
		);
	}

	const { worker, containers } = loaded.result.data;
	if (worker?.entrypoint !== undefined) {
		throw new Error(
			`${CLOUDFLARE_CONFIG_FILENAME} configures a Worker entrypoint, so this is not an assets-only project. Omit the directory so cf can build and include its server-side code.`
		);
	}
	if (containers.length > 0) {
		throw new Error(
			`${CLOUDFLARE_CONFIG_FILENAME} configures Containers, so this is not an assets-only project. Omit the directory so cf can build and include its server-side code.`
		);
	}

	return {
		settings: InputSettingsSchema.parse(loaded.result.data),
		worker: worker ?? createDefaultWorkerConfig(root),
	};
}

function createDefaultWorkerConfig(root: string): ParsedInputWorkerConfig {
	return InputWorkerSchema.parse({
		name: getWorkerNameFromProject(root),
		compatibilityDate: DEFAULT_COMPAT_DATE,
	});
}

async function resolveSourceDirectory(
	root: string,
	directory: string
): Promise<string> {
	const unresolvedDirectory = path.resolve(root, directory);
	let sourceDirectory: string;
	try {
		sourceDirectory = await fsp.realpath(unresolvedDirectory);
	} catch (error) {
		if (isNodeError(error) && error.code === "ENOENT") {
			throw new Error(`Static assets directory not found: ${directory}`);
		}
		throw error;
	}

	if (!(await fsp.stat(sourceDirectory)).isDirectory()) {
		throw new Error(`Static assets path is not a directory: ${directory}`);
	}
	return sourceDirectory;
}

function isWithin(parent: string, candidate: string): boolean {
	const pathFromParent = path.relative(parent, candidate);
	return (
		pathFromParent === "" ||
		(!path.isAbsolute(pathFromParent) &&
			pathFromParent !== ".." &&
			!pathFromParent.startsWith(`..${path.sep}`))
	);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error && "code" in error;
}
