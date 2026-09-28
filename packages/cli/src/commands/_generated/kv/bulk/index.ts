import $delete from "./delete.js";
import $get from "./get.js";
import $put from "./put.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bulk command group
 * @generated from apis/overlays/kv.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bulk",
	describe: "Operations for bulk",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($put)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
