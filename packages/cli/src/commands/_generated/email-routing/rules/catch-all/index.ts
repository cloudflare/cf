import $get from "./get.js";
import $update from "./update.js";
/**
 * catch-all command group
 * @generated from apis/overlays/email-routing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "catch-all",
	describe: "Operations for rules.catch-all",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
