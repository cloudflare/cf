/** @generated from security-insights.partners.shadow-zone-hosts.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/security-center/partners/${request.partner}/shadow-zones/${request.domain}/hosts`,
	query: ["page", "per_page"],
} as const;
