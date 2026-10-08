/** @generated from zero-trust.cws.workloads.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cws/workloads",
	query: ["cursor", "per_page", "order", "direction", "name", "policy_set_id"],
	joined: ["cursor", "per_page", "order", "direction", "name", "policy_set_id"],
} as const;
