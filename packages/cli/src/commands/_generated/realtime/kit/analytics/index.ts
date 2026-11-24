import $livestreams from "./livestreams/index.js";
import $usage from "./usage/index.js";
/**
 * analytics command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "analytics",
	describe: "Usage and livestream analytics for RealtimeKit applications",

	routes: {
		livestreams: $livestreams,
		usage: $usage,
	},
});

export default command;
