import $active from "./active/index.js";
import $create from "./create.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $livestream from "./livestream/index.js";
import $participants from "./participants/index.js";
import $replace from "./replace.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * meetings command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "meetings",
	describe: "Meetings, participants, access tokens, and meeting livestreams",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($edit)
			.command($get)
			.command($list)
			.command($replace)
			.command($active)
			.command($livestream)
			.command($participants)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
