import $edit from "./edit.js";
import $get from "./get.js";
/**
 * transformations-c2pa command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "transformations-c2pa",
	describe: "Operations for transformations-c2pa",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
