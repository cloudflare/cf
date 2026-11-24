import $create from "./create.js";
import $edit from "./edit.js";
import $get from "./get.js";
/**
 * config command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "config",
	describe: "Operations for config",

	routes: {
		create: $create,
		edit: $edit,
		get: $get,
	},
});

export default command;
