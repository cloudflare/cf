/** @generated from zero-trust.cws.tenant-structures.nodes.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cws/tenant-structures/{structure_id}/nodes",
	query: [
		"cursor",
		"per_page",
		"order",
		"direction",
		"node_kind",
		"native_id",
		"name",
		"parent",
	],
	joined: [
		"cursor",
		"per_page",
		"order",
		"direction",
		"node_kind",
		"native_id",
		"name",
		"parent",
	],
} as const;
