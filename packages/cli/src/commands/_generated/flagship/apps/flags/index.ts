import $changelog from "./changelog/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * flags command group
 * @generated from apis/overlays/flagship.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "flags",
	describe: "Operations for apps.flags",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($changelog)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
