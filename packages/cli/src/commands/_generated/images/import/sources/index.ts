import $check from "./check.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $precheck from "./pre-check.js";
import $update from "./update.js";
/**
 * sources command group
 * @generated from apis/overlays/images.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sources",
	describe: "Operations for import.sources",

	routes: {
		check: $check,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"pre-check": $precheck,
		update: $update,
	},
});

export default command;
