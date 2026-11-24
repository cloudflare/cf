import $get from "./get.js";
/**
 * connectors command group
 * @generated from apis/overlays/mesh.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connectors",
	describe: "Operations for nodes.connectors",

	routes: {
		get: $get,
	},
});

export default command;
