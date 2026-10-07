import $agents from "./agents/index.js";
import $destinations from "./destinations/index.js";
import $issues from "./issues/index.js";
import $metricsexport from "./metrics-export/index.js";
import $queries from "./queries/index.js";
import $sharedqueries from "./shared-queries/index.js";
import $telemetry from "./telemetry/index.js";
import $tracing from "./tracing/index.js";
import $usage from "./usage.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * o11y command
 * @generated from apis/overlays/o11y.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "o11y",
	describe: "o11y",

	builder: (yargs) => {
		return yargs
			.command($usage)
			.command($agents)
			.command($destinations)
			.command($issues)
			.command($metricsexport)
			.command($queries)
			.command($sharedqueries)
			.command($telemetry)
			.command($tracing)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
