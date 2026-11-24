import $edit from "./edit.js";
import $get from "./get.js";
/**
 * transformations-config command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "transformations-config",
	describe: "Operations for transformations-config",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
