import $chat from "./chat/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $livestreams from "./livestreams/index.js";
import $participants from "./participants/index.js";
import $peers from "./peers/index.js";
import $summaries from "./summaries/index.js";
import $transcripts from "./transcripts/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sessions command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sessions",
	describe:
		"Historical session data, participants, chat, transcripts, and summaries",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($chat)
			.command($livestreams)
			.command($participants)
			.command($peers)
			.command($summaries)
			.command($transcripts)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
