import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $networkpath from "./network-path/index.js";
import $update from "./update.js";
/**
 * tests command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tests",
	describe: "Operations for dex.tests",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		"network-path": $networkpath,
	},
});

export default command;
