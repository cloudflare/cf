import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $subscriptions from "./subscriptions/index.js";
import $update from "./update.js";
/**
 * streams command group
 * @generated from apis/overlays/k2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "streams",
	describe:
		"K2 streams, their retention, and the HTTP and Workers binding inputs used to produce records",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		subscriptions: $subscriptions,
	},
});

export default command;
