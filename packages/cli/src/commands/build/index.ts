import * as clack from "@clack/prompts";
import { readBuildOutput } from "@cloudflare/build-output-utils";
import {
	analyzeProject,
	configureProject,
	runProjectCommand,
} from "../../lib/autoconfig.js";
import {
	parseWorkerConfig,
	selectBuildOutputWorker,
} from "../../lib/build-output.js";
import { CliExit } from "../../lib/cli-exit.js";
import { theme } from "../../lib/ui/index.js";
import { resolveProjectImpl } from "../dev/impl.js";
import { spawnImpl } from "../dev/spawn.js";
import type { CommandOutputOptions } from "../../lib/autoconfig.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { DiscoveredImpl } from "../dev/discover.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs;
}

type BuildArgs = InferArgs<typeof builder>;

interface RunBuildOptions extends CommandOutputOptions {
	// Validate the Worker the caller will consume, so an invalid default
	// Worker cannot block a workflow that selected another one.
	worker?: string;
}

export async function runBuild(
	mode?: string,
	{ worker: selectedWorker, ...options }: RunBuildOptions = {},
	ctx: { isPreview?: boolean } = {}
): Promise<void> {
	const output = options.output ?? "stdout";
	const cwd = process.cwd();
	const details = await analyzeProject(cwd, options);
	let buildCommand = details?.buildCommand;
	const env: Record<string, string> = {
		...details?.env,
		...(ctx.isPreview ? { CLOUDFLARE_PREVIEW_BUILD: "true" } : {}),
	};

	if (details && !details.configured) {
		const summary = await configureProject(details, options);
		buildCommand = summary.buildCommand;
	}

	if (buildCommand && mode && !details?.framework?.supportsMode) {
		throw new Error(
			`The detected command \`${buildCommand}\` does not currently support \`--mode\`.`
		);
	}

	if (output !== "silent") {
		clack.log.message(theme.bold("Build"), {
			symbol: theme.muted("├"),
			spacing: 0,
			output: output === "stderr" ? process.stderr : undefined,
		});
	}

	const buildArgs = mode ? ["--mode", mode] : [];
	let result: { exitCode: number; signal?: NodeJS.Signals };
	if (buildCommand) {
		result = await runProjectCommand(buildCommand, cwd, {
			...options,
			env,
			args: buildArgs,
		});
	} else {
		const picked = resolveProjectImpl(cwd);
		if (output !== "silent") {
			clack.log.message(`Delegating to ${formatImplName(picked)}`, {
				spacing: 0,
				output: output === "stderr" ? process.stderr : undefined,
			});
		}
		result = await spawnImpl(picked, "build", buildArgs, {
			...options,
			env,
		});
	}

	if (result.exitCode !== 0 || result.signal) {
		throw new CliExit(result.exitCode, { signal: result.signal });
	}

	const { workers, rootConfig } = await readBuildOutput(cwd);
	parseWorkerConfig(
		selectBuildOutputWorker(workers, selectedWorker),
		rootConfig
	);
	if (output !== "silent") {
		clack.log.success("Build complete", {
			spacing: 0,
			output: output === "stderr" ? process.stderr : undefined,
		});
	}
}

function formatImplName(discovered: DiscoveredImpl): string {
	switch (discovered.impl.pkg) {
		case "@cloudflare/vite-plugin":
			return "Vite";
		case "wrangler":
			return "Wrangler";
		case "cloudflare-py-dev-server":
			return "the Python dev server";
		case "cloudflare-rs-dev-server":
			return "the Rust dev server";
		default:
			return discovered.impl.pkg;
	}
}

const buildCommand: CommandModule<CommonYargsOptions, BuildArgs> = {
	command: "build",
	describe: "Build a project for Cloudflare",

	builder,

	handler: async (argv): Promise<void> => {
		await runBuild(argv.mode);
	},
};

export default buildCommand;
