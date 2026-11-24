import $get from "./get.js";
/**
 * eligible command group
 * @generated from apis/overlays/alerting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "eligible",
	describe: "Operations for destinations.eligible",

	routes: {
		get: $get,
	},
});

export default command;
