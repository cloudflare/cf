import $get from "./get.js";
import $history from "./history.js";
/**
 * audit command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "audit",
	describe: "Operations for logs.audit",

	routes: {
		get: $get,
		history: $history,
	},
});

export default command;
