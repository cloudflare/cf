import $create from "./create.js";
import $delete from "./delete.js";
import $details from "./details/index.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * events command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "events",
	describe:
		"Scheduled events that temporarily override waiting room settings for sales, launches, etc.",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($update)
			.command($details)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
