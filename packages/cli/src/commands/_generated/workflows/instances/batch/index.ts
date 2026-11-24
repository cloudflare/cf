import $create from "./create.js";
import $delete from "./delete.js";
/**
 * batch command group
 * @generated from apis/overlays/workflows.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "batch",
	describe: "Operations for instances.batch",

	routes: {
		create: $create,
		delete: $delete,
	},
});

export default command;
