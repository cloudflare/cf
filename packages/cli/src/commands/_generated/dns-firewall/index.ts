import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $reversedns from "./reverse-dns/index.js";
/**
 * dns-firewall command
 * @generated from apis/overlays/dns-firewall.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dns-firewall",
	describe: "dns-firewall",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		"reverse-dns": $reversedns,
	},
});

export default command;
