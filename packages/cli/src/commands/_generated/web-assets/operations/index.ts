import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $labels from "./labels/index.js";
import $list from "./list.js";
/**
 * operations command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "operations",
	describe: "Operations for operations",

	routes: {
		"bulk-create": $bulkcreate,
		"bulk-delete": $bulkdelete,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		labels: $labels,
	},
});

export default command;
