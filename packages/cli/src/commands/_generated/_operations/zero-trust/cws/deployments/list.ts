/** @generated from zero-trust.cws.deployments.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cws/deployments",
	query: ["cursor", "per_page", "order", "direction", "name"],
	joined: ["cursor", "per_page", "order", "direction", "name"],
} as const;
