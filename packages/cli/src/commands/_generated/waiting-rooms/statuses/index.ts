import $get from "./get.js";
/**
 * statuses command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "statuses",
	describe:
		"Real-time queue status showing active users, queued users, and estimated wait times",

	routes: {
		get: $get,
	},
});

export default command;
