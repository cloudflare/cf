/** @generated from security-insights.count.by-partner */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/security-center/insights/partner-count`,
	query: ["source"],
} as const;
