import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * usage command group
 * @generated from apis/overlays/organizations.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "usage",
	describe: "Operations for billing.usage",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
