/** @generated from magic-network-monitoring-rules-create-rules-bulk */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/rules/bulk`,
	body: "json",
} as const;
