/** @generated from zero-trust.cws.tenant-structures.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/tenant-structures/${request.structure_id}`,
} as const;
