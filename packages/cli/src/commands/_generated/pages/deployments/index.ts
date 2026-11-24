import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $history from "./history/index.js";
import $list from "./list.js";
import $retry from "./retry.js";
import $rollback from "./rollback.js";
/**
 * deployments command group
 * @generated from apis/overlays/pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "deployments",
	describe: "Operations for deployments",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		retry: $retry,
		rollback: $rollback,
		history: $history,
	},
});

export default command;
