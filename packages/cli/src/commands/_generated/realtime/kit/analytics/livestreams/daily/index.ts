import $get from "./get.js";
/**
 * daily command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "daily",
	describe: "Daily livestream analytics for RealtimeKit applications",

	routes: {
		get: $get,
	},
});

export default command;
