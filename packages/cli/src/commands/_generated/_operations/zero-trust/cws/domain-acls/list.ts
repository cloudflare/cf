/** @generated from zero-trust.cws.domain-acls.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cws/domain-acls",
	query: ["cursor", "per_page", "order", "direction", "name", "deployment_id"],
	joined: ["cursor", "per_page", "order", "direction", "name", "deployment_id"],
} as const;
