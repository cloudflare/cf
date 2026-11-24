import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * ua-rules command group
 * @generated from apis/overlays/firewall.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ua-rules",
	describe: "Block or challenge requests based on the User-Agent header string",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
