import $list from "./list.js";
/**
 * events command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "events",
	describe: "Origin health changes recorded by Load Balancing analytics",

	routes: {
		list: $list,
	},
});

export default command;
