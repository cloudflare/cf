import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $delete from "./delete.js";
/**
 * zones command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zones",
	describe: "Operations for address-maps.zones",

	routes: {
		"bulk-create": $bulkcreate,
		"bulk-delete": $bulkdelete,
		create: $create,
		delete: $delete,
	},
});

export default command;
