/** @generated from origin-tls-client-auth.hostname-certificates.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames/certificates/${request.certificate_id}`,
} as const;
