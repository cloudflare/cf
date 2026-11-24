import $get from "./get.js";
import $list from "./list.js";
import $sessions from "./sessions/index.js";
import $start from "./start.js";
import $stop from "./stop.js";
/**
 * livestreams command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "livestreams",
	describe: "Independent and meeting-based livestreams and their sessions",

	routes: {
		get: $get,
		list: $list,
		start: $start,
		stop: $stop,
		sessions: $sessions,
	},
});

export default command;
