/** @generated from security-insights.classify */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/security-center/insights/${request.issue_id}/classification`,
	body: "json",
} as const;
