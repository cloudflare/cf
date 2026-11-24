import $edit from "./edit.js";
import $get from "./get.js";
/**
 * connectivity-settings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connectivity-settings",
	describe: "Operations for connectivity-settings",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
