import $cancel from "./cancel.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $messages from "./messages/index.js";
/**
 * bulk-actions command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bulk-actions",
	describe:
		"Asynchronous jobs that move or release every message matching a search — create, monitor, and manage bulk jobs",

	routes: {
		cancel: $cancel,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		messages: $messages,
	},
});

export default command;
