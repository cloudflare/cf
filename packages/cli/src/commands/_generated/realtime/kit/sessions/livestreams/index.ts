import $get from "./get.js";
/**
 * livestreams command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "livestreams",
	describe: "Livestreams associated with historical RealtimeKit sessions",

	routes: {
		get: $get,
	},
});

export default command;
