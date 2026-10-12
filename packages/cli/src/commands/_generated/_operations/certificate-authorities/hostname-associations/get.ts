/** @generated from certificate-authorities.hostname-associations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/certificate_authorities/hostname_associations`,
	query: ["mtls_certificate_id"],
} as const;
