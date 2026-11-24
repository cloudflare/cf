import $edit from "./edit.js";
import $get from "./get.js";
/**
 * regional-tiered-cache command group
 * @generated from apis/overlays/cache.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "regional-tiered-cache",
	describe:
		"Restrict tiered cache topology to data centers within a specific geographic region",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
