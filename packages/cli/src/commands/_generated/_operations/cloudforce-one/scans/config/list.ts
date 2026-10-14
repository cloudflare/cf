/** @generated from cloudforce-one.scans.config.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/scans/config`,
} as const;
