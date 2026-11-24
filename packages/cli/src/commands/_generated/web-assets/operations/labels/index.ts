import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $bulkupdate from "./bulk-update.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $update from "./update.js";
/**
 * labels command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "labels",
	describe: "Operations for operations.labels",

	routes: {
		"bulk-create": $bulkcreate,
		"bulk-delete": $bulkdelete,
		"bulk-update": $bulkupdate,
		create: $create,
		delete: $delete,
		update: $update,
	},
});

export default command;
