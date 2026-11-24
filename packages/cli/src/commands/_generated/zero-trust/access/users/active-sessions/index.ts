import $get from "./get.js";
import $list from "./list.js";
/**
 * active-sessions command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "active-sessions",
	describe: "Operations for access.users.active-sessions",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
