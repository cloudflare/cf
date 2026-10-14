/** @generated from ssl.auto-origin-tls-kex.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/auto_origin_tls_kex`,
	body: "json",
} as const;
