/** @generated from ssl.custom-certificates.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates`,
	query: ["page", "per_page", "match", "status"],
} as const;
