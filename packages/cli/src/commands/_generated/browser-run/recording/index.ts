import $get from "./get.js";
import $network from "./network/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * recording command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "recording",
	describe: "Operations for recording",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($network)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
