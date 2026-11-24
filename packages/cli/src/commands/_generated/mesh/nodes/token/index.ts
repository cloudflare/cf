import $get from "./get.js";
/**
 * token command group
 * @generated from apis/overlays/mesh.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "token",
	describe: "Operations for nodes.token",

	routes: {
		get: $get,
	},
});

export default command;
