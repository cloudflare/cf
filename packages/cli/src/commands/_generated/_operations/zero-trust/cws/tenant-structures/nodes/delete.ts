/** @generated from cws-delete-tenant-node */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/tenant-structures/${request.structure_id}/nodes/${request.node_id}`,
} as const;
