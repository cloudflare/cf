/** @generated from per-hostname-authenticated-origin-pull-delete-hostname-client-certificate */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames/certificates/${request.certificate_id}`,
} as const;
