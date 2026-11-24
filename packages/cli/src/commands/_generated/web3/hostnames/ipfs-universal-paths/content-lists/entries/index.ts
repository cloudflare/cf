import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * entries command group
 * @generated from apis/overlays/web3.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "entries",
	describe:
		"Operations for hostnames.ipfs-universal-paths.content-lists.entries",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
