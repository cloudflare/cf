import * as path from "node:path";
import { generateWorkerTypes } from "./generate.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";
import { formatOutput } from "#lib/output.js";
import {
	CLOUDFLARE_CONFIG_FILENAME,
	findCloudflareConfig,
} from "#lib/project-settings.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs.option("include-runtime", {
		type: "boolean",
		description: "Include Cloudflare Workers runtime types",
		default: true,
	});
}

type TypesArgs = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, TypesArgs> = {
	command: "types",
	describe: "Generate types from cloudflare.config.ts",
	builder,
	handler: async (argv) => {
		if (argv.local) {
			throw new Error("--local is not supported by cf workers types.");
		}

		const configPath = findCloudflareConfig();
		if (configPath === null) {
			throw new Error(
				`${CLOUDFLARE_CONFIG_FILENAME} is required by cf workers types.`
			);
		}

		const outputPath = await generateWorkerTypes({
			configPath,
			mode: argv.mode,
			includeRuntime: argv.includeRuntime,
		});

		formatOutput(
			{ path: path.relative(process.cwd(), outputPath) },
			{ quiet: argv.quiet }
		);
	},
};

export default command;
