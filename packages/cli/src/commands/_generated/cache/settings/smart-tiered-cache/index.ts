import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
/**
 * smart-tiered-cache command group
 * @generated from apis/overlays/cache.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "smart-tiered-cache",
	describe:
		"Automatically determine the best upper-tier data centers for tiered cache topology",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
	},
});

export default command;
