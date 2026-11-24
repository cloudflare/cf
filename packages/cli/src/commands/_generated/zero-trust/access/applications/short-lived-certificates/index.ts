import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * short-lived-certificates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "short-lived-certificates",
	describe: "Operations for access.applications.short-lived-certificates",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
