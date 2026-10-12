/** @generated from client-certificate-for-a-zone-list-client-certificates */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/client_certificates`,
	query: ["status", "page", "per_page", "limit", "offset"],
} as const;
