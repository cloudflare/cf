/** @generated from cloudforce-one.scans.config.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/scans/config`,
	body: "json",
} as const;
