/** @generated from zero-trust.cws.policies.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cws/policies",
	query: [
		"cursor",
		"per_page",
		"order",
		"direction",
		"name",
		"policy_set_id",
		"package_path",
	],
	joined: [
		"cursor",
		"per_page",
		"order",
		"direction",
		"name",
		"policy_set_id",
		"package_path",
	],
} as const;
