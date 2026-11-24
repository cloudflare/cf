import $create from "./create.js";
import $get from "./get.js";
import $users from "./users/index.js";
/**
 * policy-tests command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "policy-tests",
	describe: "Operations for access.applications.policy-tests",

	routes: {
		create: $create,
		get: $get,
		users: $users,
	},
});

export default command;
