import $create from "./create.js";
import $list from "./list.js";
/**
 * agreements command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "agreements",
	describe: "Operations for agreements",

	routes: {
		create: $create,
		list: $list,
	},
});

export default command;
