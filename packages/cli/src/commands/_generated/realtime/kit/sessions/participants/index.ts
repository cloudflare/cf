import $get from "./get.js";
import $list from "./list.js";
/**
 * participants command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "participants",
	describe: "Participants in historical RealtimeKit sessions",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
