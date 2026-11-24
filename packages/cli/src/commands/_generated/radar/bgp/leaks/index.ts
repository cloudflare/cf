import $events from "./events/index.js";
/**
 * leaks command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "leaks",
	describe: "Operations for bgp.leaks",

	routes: {
		events: $events,
	},
});

export default command;
