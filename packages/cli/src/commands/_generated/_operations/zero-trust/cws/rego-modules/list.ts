/** @generated from zero-trust.cws.rego-modules.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cws/rego-modules",
	query: ["cursor", "per_page", "order", "direction", "name", "package_path"],
	joined: ["cursor", "per_page", "order", "direction", "name", "package_path"],
} as const;
