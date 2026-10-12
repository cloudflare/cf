/** @generated from client-certificate-for-a-zone-list-hostname-associations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/certificate_authorities/hostname_associations`,
	query: ["mtls_certificate_id"],
} as const;
