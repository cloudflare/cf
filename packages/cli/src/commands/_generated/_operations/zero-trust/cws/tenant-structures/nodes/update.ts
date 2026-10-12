/** @generated from zero-trust.cws.tenant-structures.nodes.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/tenant-structures/${request.structure_id}/nodes/${request.node_id}`,
	body: "json",
} as const;
