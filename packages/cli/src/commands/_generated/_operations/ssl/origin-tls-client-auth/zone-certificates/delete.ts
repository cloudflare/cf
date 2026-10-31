/** @generated from ssl.origin-tls-client-auth.zone-certificates.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/${request.certificate_id}`,
} as const;
