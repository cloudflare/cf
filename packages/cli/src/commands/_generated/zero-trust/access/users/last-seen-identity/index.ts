import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * last-seen-identity command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "last-seen-identity",
	describe: "Operations for access.users.last-seen-identity",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
