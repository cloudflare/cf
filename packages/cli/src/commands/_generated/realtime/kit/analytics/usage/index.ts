import $get from "./get.js";
/**
 * usage command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "usage",
	describe: "Usage analytics for RealtimeKit applications",

	routes: {
		get: $get,
	},
});

export default command;
