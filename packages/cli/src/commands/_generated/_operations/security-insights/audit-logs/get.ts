/** @generated from security-insights.audit-logs.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/security-center/insights/${request.issue_id}/audit-log`,
	query: [
		"per_page",
		"cursor",
		"field_changed",
		"changed_by",
		"since",
		"before",
		"order",
	],
} as const;
