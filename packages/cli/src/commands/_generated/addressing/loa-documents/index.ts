import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * loa-documents command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "loa-documents",
	describe: "Operations for loa-documents",

	routes: {
		create: $create,
		get: $get,
		list: $list,
	},
});

export default command;
