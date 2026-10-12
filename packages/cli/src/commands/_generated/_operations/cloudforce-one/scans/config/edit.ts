/** @generated from post_ConfigUpdate */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/scans/config/${request.config_id}`,
	body: "json",
} as const;
