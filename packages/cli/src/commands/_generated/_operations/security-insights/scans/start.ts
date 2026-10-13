/** @generated from security-insights.scans.start */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/security-center/insights/scans`,
	body: "json",
} as const;
