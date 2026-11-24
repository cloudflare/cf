import $events from "./events/index.js";
/**
 * load-balancing-analytics command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "load-balancing-analytics",
	describe: "Operations for load-balancing-analytics",

	routes: {
		events: $events,
	},
});

export default command;
