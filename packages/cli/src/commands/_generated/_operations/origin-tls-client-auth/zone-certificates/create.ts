/** @generated from zone-level-authenticated-origin-pulls-upload-certificate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth`,
	body: "json",
} as const;
