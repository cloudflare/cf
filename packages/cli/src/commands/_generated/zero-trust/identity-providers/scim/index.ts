import $groups from "./groups/index.js";
import $users from "./users/index.js";
/**
 * scim command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scim",
	describe: "Operations for identity-providers.scim",

	routes: {
		groups: $groups,
		users: $users,
	},
});

export default command;
