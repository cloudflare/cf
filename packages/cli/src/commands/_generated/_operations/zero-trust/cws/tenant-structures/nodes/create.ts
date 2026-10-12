/** @generated from zero-trust.cws.tenant-structures.nodes.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/tenant-structures/${request.structure_id}/nodes`,
	body: "json",
} as const;
