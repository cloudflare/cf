import $bulkdelete from "./bulk-delete.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $overridecodes from "./override-codes/index.js";
/**
 * registrations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "registrations",
	describe: "Operations for devices.registrations",

	routes: {
		"bulk-delete": $bulkdelete,
		delete: $delete,
		get: $get,
		list: $list,
		"override-codes": $overridecodes,
	},
});

export default command;
