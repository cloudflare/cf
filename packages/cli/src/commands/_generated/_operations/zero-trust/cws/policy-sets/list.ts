/** @generated from zero-trust.cws.policy-sets.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cws/policy-sets",
	query: ["cursor", "per_page", "order", "direction", "name", "deployment_id"],
	joined: ["cursor", "per_page", "order", "direction", "name", "deployment_id"],
} as const;
