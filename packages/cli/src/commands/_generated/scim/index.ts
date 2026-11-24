import $groups from "./groups/index.js";
import $resourcetypes from "./resource-types/index.js";
import $schemas from "./schemas/index.js";
import $serviceproviderconfig from "./service-provider-config/index.js";
import $users from "./users/index.js";
/**
 * scim command
 * @generated from apis/overlays/scim.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scim",
	describe:
		"SCIM 2.0 provisioning — manage users, groups, and identity provider sync for your account",

	routes: {
		groups: $groups,
		"resource-types": $resourcetypes,
		schemas: $schemas,
		"service-provider-config": $serviceproviderconfig,
		users: $users,
	},
});

export default command;
