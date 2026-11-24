import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $loadefaultname from "./loa-default-name.js";
import $loa from "./loa.js";
import $status from "./status.js";
/**
 * interconnects command group
 * @generated from apis/overlays/network-interconnects.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "interconnects",
	describe:
		"Physical cross-connect and partner interconnect sessions with LOA and status tracking",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		loa: $loa,
		"loa-default-name": $loadefaultname,
		status: $status,
	},
});

export default command;
