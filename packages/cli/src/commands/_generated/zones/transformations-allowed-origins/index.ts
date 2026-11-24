import $edit from "./edit.js";
import $get from "./get.js";
/**
 * transformations-allowed-origins command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "transformations-allowed-origins",
	describe: "Operations for transformations-allowed-origins",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
