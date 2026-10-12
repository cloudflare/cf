/** @generated from per-hostname-authenticated-origin-pull-enable-or-disable-a-hostname-for-client-authentication */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin_tls_client_auth/hostnames`,
	body: "json",
} as const;
