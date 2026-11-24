import $chat from "./chat/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $livestreams from "./livestreams/index.js";
import $participants from "./participants/index.js";
import $peers from "./peers/index.js";
import $summaries from "./summaries/index.js";
import $transcripts from "./transcripts/index.js";
/**
 * sessions command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sessions",
	describe:
		"Historical session data, participants, chat, transcripts, and summaries",

	routes: {
		get: $get,
		list: $list,
		chat: $chat,
		livestreams: $livestreams,
		participants: $participants,
		peers: $peers,
		summaries: $summaries,
		transcripts: $transcripts,
	},
});

export default command;
