import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * endpoint-healthchecks command group
 * @generated from apis/overlays/diagnostics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "endpoint-healthchecks",
	describe:
		"Monitor endpoint reachability from Cloudflare with periodic ICMP health checks",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
