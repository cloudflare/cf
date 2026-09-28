import path from "node:path";
import { convertToWranglerConfig } from "@cloudflare/config";
import { normalizeAndValidateConfig } from "@cloudflare/workers-utils";
import { BuildOutputConfigError } from "./build-output-error.js";
import type {
	BuildOutputWorker,
	BuildOutputWorkers,
} from "@cloudflare/build-output-utils";
import type { ParsedOutputRootConfig } from "@cloudflare/config";
import type { ContainerlessConfig } from "@cloudflare/deploy-helpers";
import type { Config, RawConfig } from "@cloudflare/workers-utils";

// Re-export so consumers/tests have a single import site for read/validate
// errors thrown by the Build Output Specification reader.
export { BuildOutputError } from "@cloudflare/build-output-utils";
export { BuildOutputConfigError } from "./build-output-error.js";

export interface ParsedWorkerConfig {
	wranglerConfig: ContainerlessConfig;
	builtConfig: BuildOutputWorker["config"];
}

export function validateBuildOutputMode(
	requestedMode: string | undefined,
	builtMode: string | undefined,
	options: { requireRequestedMode?: boolean } = {}
): void {
	if (requestedMode === undefined) {
		if (options.requireRequestedMode && builtMode !== undefined) {
			throw new BuildOutputConfigError(
				`The Build Output was created with mode "${builtMode}", but this command did not specify a mode. Rerun with "--mode ${builtMode}".`
			);
		}
		return;
	}

	if (builtMode === undefined) {
		throw new BuildOutputConfigError(
			`The Build Output does not record which mode it was created with, but this command requested mode "${requestedMode}". Rebuild with "--mode ${requestedMode}" before deploying.`
		);
	}

	if (builtMode !== requestedMode) {
		throw new BuildOutputConfigError(
			`The Build Output was created with mode "${builtMode}", but this command requested mode "${requestedMode}". To use the existing Build Output, rerun with "--mode ${builtMode}". To deploy in ${requestedMode} mode, rebuild with "--mode ${requestedMode}" before deploying.`
		);
	}
}

/** Selects a Build Output Worker for every workflow that consumes one. */
export const buildOutputWorkerOption = {
	type: "string",
	description:
		"Name of the Worker in the Build Output to use (defaults to the default Worker)",
	requiresArg: true,
	// Repeating a string option makes yargs yield an array.
	coerce: (value: string | string[]) => {
		if (Array.isArray(value)) {
			throw new Error("--worker can only be specified once.");
		}
		return value;
	},
} as const;

/**
 * Select a Build Output Worker by its configured name, or the default Worker
 * when no name is given.
 */
export function selectBuildOutputWorker(
	workers: BuildOutputWorkers,
	name: string | undefined
): BuildOutputWorker {
	if (name === undefined) {
		return workers.default;
	}

	const named = Object.values(workers).filter(
		(worker) => worker.config.name === name
	);
	if (named.length > 1) {
		throw new BuildOutputConfigError(
			`The Build Output contains more than one Worker named "${name}".`
		);
	}
	if (named[0] !== undefined) {
		return named[0];
	}

	const { default: defaultWorker, ...additionalWorkers } = workers;
	const available = [
		`${defaultWorker.config.name} (default)`,
		...Object.values(additionalWorkers)
			.map((worker) => worker.config.name)
			.sort(),
	];
	throw new BuildOutputConfigError(
		`The Build Output has no Worker named "${name}". Available Workers: ${available.join(", ")}.`
	);
}

/**
 * Convert the Worker config read from the Build Output Specification into the
 * deploy-helpers/Wrangler config shape expected by workers-utils.
 */
export function parseWorkerConfig(
	worker: BuildOutputWorker,
	rootConfig: ParsedOutputRootConfig
): ParsedWorkerConfig {
	const builtConfig = worker.config;
	const { buildContext: _buildContext, ...settings } = rootConfig;
	const { manifest: _manifest, ...workerConfig } = builtConfig;
	const wranglerRawConfig = convertToWranglerConfig({
		...settings,
		worker: workerConfig,
		// Build Output Containers are converted separately for deployment because
		// their image references are already resolved output values.
		containers: [],
	});

	// The output config stores the entrypoint inside manifest.mainModule, but
	// convertToWranglerConfig reads `entrypoint` (InputWorkerSchema only), so
	// set `main` from the manifest against the on-disk bundle directory.
	if (builtConfig.manifest?.mainModule && worker.bundleDir) {
		wranglerRawConfig.main = path.join(
			worker.bundleDir,
			builtConfig.manifest.mainModule
		);
	}

	const userConfigPath = path.resolve("cloudflare.config.ts");
	const { validationConfig, containerReferences } =
		prepareContainerlessValidationConfig(wranglerRawConfig);

	const validatedConfig = validateWranglerConfig(
		validationConfig,
		worker.configPath,
		userConfigPath
	);
	restoreContainerReferences(validatedConfig, containerReferences);
	const { containers: _containers, ...wranglerConfig } = validatedConfig;

	return {
		wranglerConfig,
		builtConfig,
	};
}

export function validateWranglerConfig(
	rawConfig: RawConfig,
	builtConfigPath: string,
	userConfigPath: string
): Config {
	const { config, diagnostics } = normalizeAndValidateConfig(
		rawConfig,
		builtConfigPath,
		userConfigPath,
		{} // no need to pass in env/mode - already resolved at build
	);

	if (diagnostics.hasErrors()) {
		throw new BuildOutputConfigError(diagnostics.renderErrors());
	}

	if (diagnostics.hasWarnings()) {
		console.warn(diagnostics.renderWarnings());
	}

	return config;
}

/**
 * Validate the Worker without Containers, then restore the `container` fields
 * in its Durable Object configuration for deployment validation.
 */
function prepareContainerlessValidationConfig(rawConfig: RawConfig): {
	validationConfig: RawConfig;
	containerReferences: Map<string, string>;
} {
	const { containers: _containers, ...validationConfig } = rawConfig;
	const containerReferences = new Map<string, string>();

	if (validationConfig.exports !== undefined) {
		validationConfig.exports = Object.fromEntries(
			Object.entries(validationConfig.exports).map(
				([className, exportConfig]) => {
					if (
						!("container" in exportConfig) ||
						typeof exportConfig.container !== "string"
					) {
						return [className, exportConfig];
					}

					containerReferences.set(className, exportConfig.container);
					const { container: _container, ...containerlessExport } =
						exportConfig;
					return [className, containerlessExport];
				}
			)
		);
	}

	return { validationConfig, containerReferences };
}

function restoreContainerReferences(
	config: Config,
	containerReferences: Map<string, string>
): void {
	if (config.exports === undefined || containerReferences.size === 0) {
		return;
	}

	config.exports = Object.fromEntries(
		Object.entries(config.exports).map(([className, exportConfig]) => {
			const container = containerReferences.get(className);
			return [
				className,
				container === undefined ? exportConfig : { ...exportConfig, container },
			];
		})
	);
}
