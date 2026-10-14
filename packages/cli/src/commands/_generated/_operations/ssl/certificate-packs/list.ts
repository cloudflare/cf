/** @generated from ssl.certificate-packs.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/certificate_packs`,
	query: ["page", "per_page", "status", "deploy"],
} as const;
