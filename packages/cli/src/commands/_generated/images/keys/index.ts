import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * keys command group
 * @generated from apis/overlays/images.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "keys",
	describe: "Manage signing keys for generating private image URLs",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
