/** @generated from magic-network-monitoring-rules-list-rules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/rules`,
} as const;
