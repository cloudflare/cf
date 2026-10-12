/** @generated from per-hostname-authenticated-origin-pull-get-the-hostname-status-for-client-authentication */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames/${request.hostname}`,
} as const;
