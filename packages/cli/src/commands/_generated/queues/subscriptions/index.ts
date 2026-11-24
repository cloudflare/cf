import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * subscriptions command group
 * @generated from apis/overlays/queues.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "subscriptions",
	describe: "Manage queue subscriptions for event-driven message routing",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
