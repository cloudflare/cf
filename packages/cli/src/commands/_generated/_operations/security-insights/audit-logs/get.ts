/** @generated from security-insights.audit-logs.get */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/security-center/insights/{issue_id}/audit-log",
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
