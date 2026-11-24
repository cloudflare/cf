import $start from "./start.js";
/**
 * tracks command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tracks",
	describe: "Participant-track recordings for RealtimeKit meetings",

	routes: {
		start: $start,
	},
});

export default command;
