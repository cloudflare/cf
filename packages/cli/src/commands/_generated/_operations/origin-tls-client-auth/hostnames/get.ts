/** @generated from origin-tls-client-auth.hostnames.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames/${request.hostname}`,
} as const;
