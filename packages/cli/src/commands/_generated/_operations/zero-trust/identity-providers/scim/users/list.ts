/** @generated from zero-trust.identity-providers.scim.users.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/access/identity_providers/{identity_provider_id}/scim/users",
	query: [
		"cf_resource_id",
		"idp_resource_id",
		"username",
		"email",
		"name",
		"page",
		"per_page",
	],
} as const;
