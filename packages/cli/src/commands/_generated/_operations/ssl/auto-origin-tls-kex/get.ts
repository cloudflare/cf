/** @generated from ssl-detector-auto-origin-tls-kex-get-enrollment */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/auto_origin_tls_kex`,
} as const;
