import $nodes from "./nodes/index.js";
/**
 * mesh command
 * @generated from apis/overlays/mesh.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "mesh",
	describe: "mesh",

	routes: {
		nodes: $nodes,
	},
});

export default command;
