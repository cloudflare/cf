import $events from "./events/index.js";
/**
 * hijacks command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hijacks",
	describe: "Operations for bgp.hijacks",

	routes: {
		events: $events,
	},
});

export default command;
