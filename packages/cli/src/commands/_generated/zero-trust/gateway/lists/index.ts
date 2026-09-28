import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $items from "./items/index.js";
import $list from "./list.js";
import $update from "./update.js";
import $upload from "./upload.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * lists command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "lists",
	describe: "Operations for gateway.lists",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($update)
			.command($upload)
			.command($items)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
