import $origin from "./origin.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ases command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ases",
	describe: "Operations for attacks.layer7.top.ases",

	builder: (yargs) => {
		return yargs
			.command($origin)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
