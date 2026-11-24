import $actors from "./actors/index.js";
import $categories from "./categories/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $indicators from "./indicators/index.js";
import $list from "./list.js";
import $relationships from "./relationships/index.js";
import $update from "./update.js";
/**
 * tags command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tags",
	describe: "Operations for threat-intel.tags",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		actors: $actors,
		categories: $categories,
		indicators: $indicators,
		relationships: $relationships,
	},
});

export default command;
