import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $replace from "./replace.js";
import $tokens from "./tokens/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * participants command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "participants",
	describe: "Participants in RealtimeKit meetings",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($replace)
			.command($tokens)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
