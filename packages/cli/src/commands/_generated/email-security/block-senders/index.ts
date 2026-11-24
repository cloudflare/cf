import $bulkapply from "./bulk-apply.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * block-senders command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "block-senders",
	describe: "Operations for block-senders",

	routes: {
		"bulk-apply": $bulkapply,
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
