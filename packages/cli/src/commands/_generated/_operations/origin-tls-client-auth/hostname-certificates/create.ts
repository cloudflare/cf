/** @generated from origin-tls-client-auth.hostname-certificates.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames/certificates`,
	body: "json",
} as const;
