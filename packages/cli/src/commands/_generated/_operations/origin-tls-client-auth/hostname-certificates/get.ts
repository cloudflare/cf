/** @generated from origin-tls-client-auth.hostname-certificates.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames/certificates/${request.certificate_id}`,
} as const;
