import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * verification command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "verification",
	describe: "Operations for domains.verification",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
