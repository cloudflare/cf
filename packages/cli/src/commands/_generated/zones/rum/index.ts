import $edit from "./edit.js";
import $get from "./get.js";
/**
 * rum command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rum",
	describe: "Rum operations",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
