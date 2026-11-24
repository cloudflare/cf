import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $delete from "./delete.js";
/**
 * ips command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ips",
	describe: "Operations for address-maps.ips",

	routes: {
		"bulk-create": $bulkcreate,
		"bulk-delete": $bulkdelete,
		create: $create,
		delete: $delete,
	},
});

export default command;
