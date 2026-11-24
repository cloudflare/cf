import $get from "./get.js";
/**
 * override-codes command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "override-codes",
	describe: "Operations for devices.registrations.override-codes",

	routes: {
		get: $get,
	},
});

export default command;
