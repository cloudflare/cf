import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
/**
 * warp command group
 * @generated from apis/overlays/network.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "warp",
	describe: "Operations for subnets.warp",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
	},
});

export default command;
