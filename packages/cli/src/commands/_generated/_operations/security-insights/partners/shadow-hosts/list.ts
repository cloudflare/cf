/** @generated from security-insights.partners.shadow-hosts.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/security-center/partners/${request.partner}/shadow-hosts`,
	query: ["page", "per_page"],
} as const;
