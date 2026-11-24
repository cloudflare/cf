import $get from "./get.js";
/**
 * raw command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "raw",
	describe: "Operations for threat-intel.events.raw",

	routes: {
		get: $get,
	},
});

export default command;
