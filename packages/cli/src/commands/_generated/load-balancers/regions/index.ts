import $get from "./get.js";
import $list from "./list.js";
/**
 * regions command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "regions",
	describe:
		"Geographic regions used for regional pool steering and traffic policies",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
