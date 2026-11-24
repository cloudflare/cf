import $get from "./get.js";
import $update from "./update.js";
/**
 * raw command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "raw",
	describe: "Operations for threat-intel.events.legacy.raw",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
