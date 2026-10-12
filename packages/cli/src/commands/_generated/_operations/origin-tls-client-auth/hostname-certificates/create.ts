/** @generated from per-hostname-authenticated-origin-pull-upload-a-hostname-client-certificate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames/certificates`,
	body: "json",
} as const;
