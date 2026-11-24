import $list from "./list.js";
/**
 * permission-groups command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "permission-groups",
	describe: "Operations for tokens.permission-groups",

	routes: {
		list: $list,
	},
});

export default command;
