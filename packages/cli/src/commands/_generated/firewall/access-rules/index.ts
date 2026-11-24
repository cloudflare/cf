import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * access-rules command group
 * @generated from apis/overlays/firewall.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "access-rules",
	describe:
		"IP-based access rules that allow, block, challenge, or whitelist traffic globally or per-zone",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
