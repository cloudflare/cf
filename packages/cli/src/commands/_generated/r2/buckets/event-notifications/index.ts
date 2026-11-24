import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * event-notifications command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "event-notifications",
	describe: "Operations for buckets.event-notifications",

	routes: {
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
