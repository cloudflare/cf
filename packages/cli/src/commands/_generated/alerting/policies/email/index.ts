import $details from "./details.js";
import $unsubscribe from "./unsubscribe.js";
/**
 * email command group
 * @generated from apis/overlays/alerting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "email",
	describe: "Operations for policies.email",

	routes: {
		details: $details,
		unsubscribe: $unsubscribe,
	},
});

export default command;
