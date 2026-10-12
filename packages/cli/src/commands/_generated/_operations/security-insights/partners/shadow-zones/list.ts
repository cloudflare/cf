/** @generated from security-insights.partners.shadow-zones.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/security-center/partners/${request.partner}/shadow-zones`,
	query: ["page", "per_page"],
} as const;
