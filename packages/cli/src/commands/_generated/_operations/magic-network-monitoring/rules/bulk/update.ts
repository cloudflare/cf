/** @generated from magic-network-monitoring-rules-update-rules-bulk */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/rules/bulk`,
	body: "json",
} as const;
