/** @generated from zero-trust.access.logs.scim.updates.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/logs/scim/updates`,
	query: [
		"limit",
		"direction",
		"since",
		"until",
		"idp_id",
		"status",
		"resource_type",
		"request_method",
		"resource_user_email",
		"resource_group_name",
		"cf_resource_id",
		"idp_resource_id",
		"page",
		"per_page",
	],
} as const;
