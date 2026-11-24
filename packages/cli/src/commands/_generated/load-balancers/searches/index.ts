import $list from "./list.js";
/**
 * searches command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "searches",
	describe:
		"Search across all load balancer resources (pools, monitors, load balancers) by name or reference",

	routes: {
		list: $list,
	},
});

export default command;
