import $latency from "./latency/index.js";
import $query from "./query/index.js";
import $sql from "./sql/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * analytics command
 * @generated from apis/overlays/analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "analytics",
	describe:
		"Zone-level traffic analytics — dashboard summaries, per-colo breakdowns, and Argo latency metrics",

	builder: (yargs) => {
		return yargs
			.command($latency)
			.command($query)
			.command($sql)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
