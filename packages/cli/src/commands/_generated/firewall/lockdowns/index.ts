import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * lockdowns command group
 * @generated from apis/overlays/firewall.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "lockdowns",
	describe:
		"Zone lockdown rules that restrict access to URLs by IP address or range",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
