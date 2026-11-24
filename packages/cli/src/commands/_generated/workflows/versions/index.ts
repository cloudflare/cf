import $get from "./get.js";
import $graph from "./graph.js";
import $list from "./list.js";
/**
 * versions command group
 * @generated from apis/overlays/workflows.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "versions",
	describe: "Workflow version operations",

	routes: {
		get: $get,
		graph: $graph,
		list: $list,
	},
});

export default command;
