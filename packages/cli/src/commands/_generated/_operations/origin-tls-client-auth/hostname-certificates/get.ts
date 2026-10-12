/** @generated from per-hostname-authenticated-origin-pull-get-the-hostname-client-certificate */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames/certificates/${request.certificate_id}`,
} as const;
