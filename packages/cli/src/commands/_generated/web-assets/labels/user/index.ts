import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $operations from "./operations/index.js";
import $update from "./update.js";
/**
 * user command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "user",
	describe: "Operations for labels.user",

	routes: {
		"bulk-create": $bulkcreate,
		"bulk-delete": $bulkdelete,
		delete: $delete,
		edit: $edit,
		get: $get,
		update: $update,
		operations: $operations,
	},
});

export default command;
