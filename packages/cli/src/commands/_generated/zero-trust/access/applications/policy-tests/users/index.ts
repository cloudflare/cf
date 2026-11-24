import $list from "./list.js";
/**
 * users command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "users",
	describe: "Operations for access.applications.policy-tests.users",

	routes: {
		list: $list,
	},
});

export default command;
