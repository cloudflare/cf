import $edit from "./edit.js";
import $get from "./get.js";
/**
 * advertisement-status command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "advertisement-status",
	describe: "Operations for prefixes.advertisement-status",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
