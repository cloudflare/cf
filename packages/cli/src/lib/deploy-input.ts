import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { BuildOutputConfigError } from "./build-output.js";
import type { SharedUploadArgs } from "../commands/deploy/shared.js";
import type {
	BuildOutputWorker,
	ResolvedOutputWorkerConfig,
} from "@cloudflare/build-output-utils";
import type { ModuleType } from "@cloudflare/config";
import type {
	ContainerDeployConfig,
	DeployProps,
	TriggerProps,
	VersionsUploadProps,
	WorkerBuildResult,
} from "@cloudflare/deploy-helpers";
import type {
	CfModule,
	CfModuleType,
	CfWorkerSourceMap,
	Config,
	Entry,
	Route,
	ValidatedAssetsOptions,
} from "@cloudflare/workers-utils";

type DeployUploadArgs = SharedUploadArgs & {
	force?: boolean;
	"dispatch-namespace"?: string;
	"containers-rollout"?: "immediate" | "gradual" | "none";
};

const OUTPUT_TO_CF_MODULE_TYPE: Record<
	Exclude<ModuleType, "sourcemap">,
	CfModuleType
> = {
	esm: "esm",
	cjs: "commonjs",
	python: "python",
	"python-requirement": "python-requirement",
	wasm: "compiled-wasm",
	text: "text",
	data: "buffer",
	json: "text",
};

function createSharedProps(
	worker: BuildOutputWorker,
	config: Config,
	accountId: string | undefined,
	argv: SharedUploadArgs,
	containers: ContainerDeployConfig
) {
	const projectRoot = process.cwd();
	const entryFile = config.main ?? "";

	const entry: Entry = {
		file: entryFile,
		projectRoot,
		configPath: worker.configPath,
		format: "modules",
		moduleRoot: entryFile ? dirname(entryFile) : (worker.bundleDir ?? ""),
		exports: [],
	};

	return {
		entry,
		name: worker.config.name,
		compatibilityDate: config.compatibility_date,
		compatibilityFlags: config.compatibility_flags ?? [],
		assetsDir: resolveAssetsDir(worker, config),
		main: config.main ?? undefined,
		keepVars: config.keep_vars ?? false,
		dryRun: argv["dry-run"],
		env: undefined, // 'mode' is a build-time only concept now
		outfile: undefined,
		tag: argv.tag,
		message: argv.message,
		secretsFile: argv["secrets-file"],
		// Matches wrangler's default (`--experimental-auto-create`, default
		// true): when a draft binding needs a resource, create one named
		// `<worker>-<binding>` directly rather than prompting to connect an
		// existing resource. This skips the interactive select() picker (and
		// the resource-list API calls that back it), which suits cf's
		// non-interactive/agent emphasis.
		experimentalAutoCreate: true,
		accountId,
		sendMetrics: false,
		resourcesProvision: true,
		// cf never reads or writes the source Worker config, so we don't write
		// provisioned resource IDs back. deploy-helpers logs a note instead;
		// future deploys reuse the resources via inherited bindings.
		skipProvisioningConfigWriteback: true,
		skipLastDeployedFromApiCheck: false, // TODO(soon): delete when gone from deploy-workers
		containers,
		// The following are for features that will not be supported in cf:
		cliVars: {},
		isWorkersSite: false,
		useServiceEnvApiPath: false,
	} as const;
}

export function createDeployProps(
	worker: BuildOutputWorker,
	config: Config,
	accountId: string | undefined,
	argv: DeployUploadArgs,
	containers: ContainerDeployConfig
): DeployProps {
	return {
		...createSharedProps(worker, config, accountId, argv, containers),
		command: "deploy",
		containersRollout: argv["containers-rollout"],
		triggers: config.triggers?.crons,
		routes: resolveRoutes(config),
		logpush: config.logpush,
		dispatchNamespace: argv["dispatch-namespace"],
		strict: !argv.force,
		legacyAssetPaths: undefined,
		oldAssetTtl: undefined,
	};
}

export function createVersionsUploadProps(
	worker: BuildOutputWorker,
	config: Config,
	accountId: string | undefined,
	argv: SharedUploadArgs & { "preview-alias"?: string },
	containers: ContainerDeployConfig
): VersionsUploadProps {
	return {
		...createSharedProps(worker, config, accountId, argv, containers),
		command: "versions upload",
		strict: true,
		previewAlias: argv["preview-alias"],
	};
}

export function createTriggerProps(
	worker: BuildOutputWorker,
	config: Config,
	accountId: string | undefined,
	argv: { "dry-run": boolean }
): TriggerProps {
	return {
		config,
		accountId,
		scriptName: config.name ?? worker.config.name,
		crons: config.triggers?.crons,
		routes: resolveRoutes(config),
		firstDeploy: false,
		dryRun: argv["dry-run"],
		validated: false,
	};
}

function resolveRoutes(config: Config): Route[] {
	if (config.routes) {
		return config.routes;
	}
	if (config.route) {
		return [config.route];
	}
	return [];
}

function resolveAssetsDir(
	worker: BuildOutputWorker,
	config: Config
): ValidatedAssetsOptions | undefined {
	const directory = worker.assetsDir;
	if (!directory) {
		return undefined;
	}

	const hasUserWorker = Boolean(config.main);
	const runWorkerFirst = config.assets?.run_worker_first;

	if (!hasUserWorker && runWorkerFirst) {
		throw new BuildOutputConfigError(
			"assets.run_worker_first requires a Worker entrypoint, but no main module is configured."
		);
	}

	return {
		directory,
		binding: config.assets?.binding,
		// The reader only sets worker.assetsDir when the directory exists on disk.
		directoryExists: true,
	};
}

// TODO: possibly pull in shared code from workers-utils?
export function assembleBuildResult(
	worker: BuildOutputWorker,
	outputConfig: ResolvedOutputWorkerConfig
): WorkerBuildResult {
	// Assets-only deploys have no manifest / bundle: deploy() creates a
	// synthetic Worker, so there are no modules to assemble. The package
	// guarantees a manifest implies a bundle/ directory, so checking both
	// here narrows worker to its `bundleDir: string` arm for the rest.
	if (!outputConfig.manifest || !worker.bundleDir) {
		return {
			modules: [],
			sourceMaps: undefined,
			dependencies: {},
			resolvedEntryPointPath: "",
			bundleType: "esm",
			content: "",
		};
	}

	const { mainModule, modules } = outputConfig.manifest;
	validateModulePath(mainModule, worker.bundleDir);
	const resolvedEntryPointPath = join(worker.bundleDir, mainModule);

	if (!existsSync(resolvedEntryPointPath)) {
		throw new BuildOutputConfigError(
			`Main module not found: ${resolvedEntryPointPath}`
		);
	}

	const mainType = modules?.[mainModule]?.type ?? "esm";
	if (mainType === "sourcemap") {
		throw new BuildOutputConfigError(
			`Main module "${mainModule}" cannot be a sourcemap.`
		);
	}

	const content = readFileSync(resolvedEntryPointPath, "utf8");
	const bundleType = OUTPUT_TO_CF_MODULE_TYPE[mainType];
	const cfModules: CfModule[] = [];
	const sourceMaps: CfWorkerSourceMap[] = [];
	const dependencies: Record<string, { bytesInOutput: number }> = {};

	dependencies[resolvedEntryPointPath] = {
		bytesInOutput: statSync(resolvedEntryPointPath).size,
	};

	if (modules) {
		for (const [name, meta] of Object.entries(modules)) {
			if (name === mainModule) {
				continue;
			}

			validateModulePath(name, worker.bundleDir);
			const filePath = join(worker.bundleDir, name);

			if (meta.type === "sourcemap") {
				if (!existsSync(filePath)) {
					throw new BuildOutputConfigError(`Module not found: ${filePath}`);
				}
				sourceMaps.push({
					name,
					content: readFileSync(filePath, "utf8"),
				});
				continue;
			}

			if (!existsSync(filePath)) {
				throw new BuildOutputConfigError(`Module not found: ${filePath}`);
			}

			const moduleContent =
				meta.type === "wasm" || meta.type === "data"
					? readFileSync(filePath)
					: readFileSync(filePath, "utf8");

			cfModules.push({
				name: `./${name}`,
				filePath,
				content: moduleContent,
				type: OUTPUT_TO_CF_MODULE_TYPE[meta.type],
			});

			dependencies[filePath] = {
				bytesInOutput: statSync(filePath).size,
			};
		}
	}

	return {
		modules: cfModules,
		sourceMaps: sourceMaps.length > 0 ? sourceMaps : undefined,
		dependencies,
		resolvedEntryPointPath,
		bundleType,
		content,
	};
}

function validateModulePath(name: string, bundlePath: string): void {
	const resolved = join(bundlePath, name);
	if (resolved !== bundlePath && !resolved.startsWith(bundlePath + sep)) {
		throw new BuildOutputConfigError(
			`Module path "${name}" escapes the bundle directory.`
		);
	}
}
