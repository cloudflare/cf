/** @generated from access-identity-providers-list-scim-group-resources */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/identity_providers/${request.identity_provider_id}/scim/groups`,
	query: ["cf_resource_id", "idp_resource_id", "name", "page", "per_page"],
} as const;
