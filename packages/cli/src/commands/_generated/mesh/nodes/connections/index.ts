import $list from "./list.js";
/**
 * connections command group
 * @generated from apis/overlays/mesh.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connections",
	describe: "Operations for nodes.connections",

	routes: {
		list: $list,
	},
});

export default command;
