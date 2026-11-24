import $list from "./list.js";
/**
 * references command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "references",
	describe: "List references to monitor groups used by load balancer pools",

	routes: {
		list: $list,
	},
});

export default command;
