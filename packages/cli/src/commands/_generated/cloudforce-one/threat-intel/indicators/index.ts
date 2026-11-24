import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $relationships from "./relationships/index.js";
import $tags from "./tags/index.js";
import $types from "./types/index.js";
import $update from "./update.js";
/**
 * indicators command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "indicators",
	describe: "Operations for threat-intel.indicators",

	routes: {
		"bulk-create": $bulkcreate,
		"bulk-delete": $bulkdelete,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		relationships: $relationships,
		tags: $tags,
		types: $types,
	},
});

export default command;
