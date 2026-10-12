/** @generated from post_ConfigCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/scans/config`,
	body: "json",
} as const;
