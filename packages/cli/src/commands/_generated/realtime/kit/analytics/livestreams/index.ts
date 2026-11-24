import $daily from "./daily/index.js";
import $get from "./get.js";
/**
 * livestreams command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "livestreams",
	describe: "Livestream analytics for RealtimeKit applications",

	routes: {
		get: $get,
		daily: $daily,
	},
});

export default command;
