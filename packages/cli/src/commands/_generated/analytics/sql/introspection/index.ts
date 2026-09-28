import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * introspection command group
 * @generated from apis/overlays/analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "introspection",
	describe: "Operations for sql.introspection",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
