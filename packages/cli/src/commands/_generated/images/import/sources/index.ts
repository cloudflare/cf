import $check from "./check.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $precheck from "./pre-check.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sources command group
 * @generated from apis/overlays/images.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sources",
	describe: "Operations for import.sources",

	builder: (yargs) => {
		return yargs
			.command($check)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($precheck)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
