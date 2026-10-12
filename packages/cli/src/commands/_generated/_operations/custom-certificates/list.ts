/** @generated from custom-ssl-for-a-zone-list-ssl-configurations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates`,
	query: ["page", "per_page", "match", "status"],
} as const;
