import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $regions from "./regions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * regional-hostnames command group
 * @generated from apis/overlays/addressing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "regional-hostnames",
	describe: "Operations for regional-hostnames",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($regions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
