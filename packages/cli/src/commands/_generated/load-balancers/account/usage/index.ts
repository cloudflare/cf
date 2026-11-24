import $list from "./list.js";
/**
 * usage command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "usage",
	describe: "Current load balancer resource usage counts for an account",

	routes: {
		list: $list,
	},
});

export default command;
