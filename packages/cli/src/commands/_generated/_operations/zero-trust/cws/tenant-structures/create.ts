/** @generated from zero-trust.cws.tenant-structures.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/tenant-structures`,
	body: "json",
} as const;
