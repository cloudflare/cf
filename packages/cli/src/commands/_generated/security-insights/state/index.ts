import $get from "./get.js";
import $update from "./update.js";
/**
 * state command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "state",
	describe: "Operations for state",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
