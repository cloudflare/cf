import $availabilities from "./availabilities/index.js";
import $pages from "./pages/index.js";
import $schedule from "./schedule/index.js";
/**
 * speed command
 * @generated from apis/overlays/speed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "speed",
	describe:
		"Observatory speed tests — run Lighthouse audits, track performance trends, and schedule recurring tests",

	routes: {
		availabilities: $availabilities,
		pages: $pages,
		schedule: $schedule,
	},
});

export default command;
