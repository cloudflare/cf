/** @generated from zone-level-authenticated-origin-pulls-list-certificates */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth`,
} as const;
