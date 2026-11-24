import $get from "./get.js";
import $update from "./update.js";
/**
 * settings command group
 * @generated from apis/overlays/network-interconnects.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Account-level interconnect settings and default configurations",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
