/** @generated from web-analytics-create-rule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/v2/${request.ruleset_id}/rule`,
	body: "json",
} as const;
