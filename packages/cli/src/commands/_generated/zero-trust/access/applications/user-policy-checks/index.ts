import $list from "./list.js";
/**
 * user-policy-checks command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "user-policy-checks",
	describe: "Operations for access.applications.user-policy-checks",

	routes: {
		list: $list,
	},
});

export default command;
