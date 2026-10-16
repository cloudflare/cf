/** @generated from ssl.origin-tls-client-auth.hostnames.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames`,
	body: "json",
} as const;
