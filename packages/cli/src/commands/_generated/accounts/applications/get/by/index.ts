import $id from "./id.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * by command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "by",
	describe: "Operations for applications.get.by",

	builder: (yargs) => {
		return yargs.command($id).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
