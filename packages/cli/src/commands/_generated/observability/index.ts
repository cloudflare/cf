import $destinations from "./destinations/index.js";
import $issues from "./issues/index.js";
import $queries from "./queries/index.js";
import $sharedqueries from "./shared-queries/index.js";
import $telemetry from "./telemetry/index.js";
import $tracing from "./tracing/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * observability command
 * @generated from apis/overlays/observability.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "observability",
	describe: "observability",

	builder: (yargs) => {
		return yargs
			.command($destinations)
			.command($issues)
			.command($queries)
			.command($sharedqueries)
			.command($telemetry)
			.command($tracing)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
