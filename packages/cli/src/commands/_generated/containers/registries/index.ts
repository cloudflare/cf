import $create from "./create.js";
import $credentials from "./credentials/index.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * registries command group
 * @generated from apis/overlays/containers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "registries",
	describe: "Manage Containers image registries",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		credentials: $credentials,
	},
});

export default command;
