/** @generated from access-identity-providers-delete-scim-group-resource */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/identity_providers/${request.identity_provider_id}/scim/groups/${request.group_id}`,
	response: false,
} as const;
