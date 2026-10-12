/** @generated from magic-network-monitoring-rules-delete-rule */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/rules/${request.rule_id}`,
} as const;
