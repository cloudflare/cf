import $get from "./get.js";
import $update from "./update.js";
/**
 * ct-alerting command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ct-alerting",
	describe: "Operations for ct-alerting",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
