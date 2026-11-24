import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * hostname-certificates command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hostname-certificates",
	describe: "Operations for origin-tls-client-auth.hostname-certificates",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
