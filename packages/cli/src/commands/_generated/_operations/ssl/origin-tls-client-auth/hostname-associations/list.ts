/** @generated from ssl.origin-tls-client-auth.hostname-associations.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames`,
	query: ["page", "per_page", "status"],
} as const;
