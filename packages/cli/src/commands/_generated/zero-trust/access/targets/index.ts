import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $bulkreplacetags from "./bulk-replace-tags.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * targets command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "targets",
	describe: "Operations for access.targets",

	routes: {
		"bulk-create": $bulkcreate,
		"bulk-delete": $bulkdelete,
		"bulk-replace-tags": $bulkreplacetags,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
