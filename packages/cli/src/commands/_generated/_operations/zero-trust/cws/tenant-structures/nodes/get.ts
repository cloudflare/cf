/** @generated from zero-trust.cws.tenant-structures.nodes.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/tenant-structures/${request.structure_id}/nodes/${request.node_id}`,
} as const;
