/** @generated from magic-network-monitoring-rules-create-rules */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/rules`,
	body: "json",
} as const;
