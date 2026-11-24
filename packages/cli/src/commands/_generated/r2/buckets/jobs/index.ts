import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * jobs command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "jobs",
	describe: "Create and inspect background jobs for an R2 bucket",

	routes: {
		create: $create,
		get: $get,
		list: $list,
	},
});

export default command;
