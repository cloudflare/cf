import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $put from "./put.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * keys command group
 * @generated from apis/overlays/kv.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "keys",
	describe: "Operations for keys",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($list)
			.command($put)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
