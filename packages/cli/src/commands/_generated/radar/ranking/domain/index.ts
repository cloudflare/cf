import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * domain command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "domain",
	describe: "Operations for ranking.domain",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
