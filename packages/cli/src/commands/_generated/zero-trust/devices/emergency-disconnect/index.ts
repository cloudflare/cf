import $get from "./get.js";
import $set from "./set.js";
/**
 * emergency-disconnect command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "emergency-disconnect",
	describe: "Operations for devices.emergency-disconnect",

	routes: {
		get: $get,
		set: $set,
	},
});

export default command;
