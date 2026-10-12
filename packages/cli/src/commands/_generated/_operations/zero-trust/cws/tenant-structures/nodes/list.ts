/** @generated from zero-trust.cws.tenant-structures.nodes.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/tenant-structures/${request.structure_id}/nodes`,
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
