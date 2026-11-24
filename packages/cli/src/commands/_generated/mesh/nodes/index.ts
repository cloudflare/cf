import $configurations from "./configurations/index.js";
import $connections from "./connections/index.js";
import $connectors from "./connectors/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $failover from "./failover.js";
import $get from "./get.js";
import $list from "./list.js";
import $token from "./token/index.js";
/**
 * nodes command group
 * @generated from apis/overlays/mesh.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "nodes",
	describe: "Operations for nodes",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		failover: $failover,
		get: $get,
		list: $list,
		configurations: $configurations,
		connections: $connections,
		connectors: $connectors,
		token: $token,
	},
});

export default command;
