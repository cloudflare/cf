import $colos from "./colos/index.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * latency command group
 * @generated from apis/overlays/analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "latency",
	describe:
		"Argo Smart Routing latency analytics showing time-to-first-byte improvements",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($colos)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
