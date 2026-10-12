/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/security-center/insights/audit-log */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/security-center/insights/audit-log`,
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
