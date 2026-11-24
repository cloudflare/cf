import $edit from "./edit.js";
import $get from "./get.js";
/**
 * fonts command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "fonts",
	describe: "Fonts operations",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
