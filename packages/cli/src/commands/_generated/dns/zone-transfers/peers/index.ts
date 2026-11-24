import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * peers command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "peers",
	describe: "Operations for zone-transfers.peers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
