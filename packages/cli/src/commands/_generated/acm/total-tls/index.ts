import $edit from "./edit.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * total-tls command group
 * @generated from apis/overlays/acm.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "total-tls",
	describe: "Operations for total-tls",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
