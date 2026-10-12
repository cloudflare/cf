/** @generated from web-analytics-update-rule */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/v2/${request.ruleset_id}/rule/${request.rule_id}`,
	body: "json",
} as const;
