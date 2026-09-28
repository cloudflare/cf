import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * schema command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "schema",
	describe: "Operations for rules.email.schema",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
