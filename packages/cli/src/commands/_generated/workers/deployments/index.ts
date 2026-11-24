import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * deployments command group
 * @generated from apis/overlays/workers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "deployments",
	describe: "Manage Worker deployments and traffic versions",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
