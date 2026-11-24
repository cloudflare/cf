import $list from "./list.js";
/**
 * references command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "references",
	describe: "List load balancing resources that use an origin pool",

	routes: {
		list: $list,
	},
});

export default command;
