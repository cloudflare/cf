/** @generated from magic-network-monitoring.rules.advertisements.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/rules/${request.rule_id}/advertisement`,
} as const;
