import $oauthclients from "./oauth-clients/index.js";
import $oauthscopes from "./oauth-scopes/index.js";
import $permissiongroups from "./permission-groups/index.js";
import $resourcegroups from "./resource-groups/index.js";
import $sso from "./sso/index.js";
import $usergroups from "./user-groups/index.js";
/**
 * iam command
 * @generated from apis/overlays/iam.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "iam",
	describe:
		"Identity and access management — permission groups, resource groups, user groups, and SSO connectors",

	routes: {
		"oauth-clients": $oauthclients,
		"oauth-scopes": $oauthscopes,
		"permission-groups": $permissiongroups,
		"resource-groups": $resourcegroups,
		sso: $sso,
		"user-groups": $usergroups,
	},
});

export default command;
