/** @generated from get-zone-security-center-partner-shadow-hosts */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/security-center/partners/${request.partner}/shadow-hosts`,
	query: ["page", "per_page"],
} as const;
