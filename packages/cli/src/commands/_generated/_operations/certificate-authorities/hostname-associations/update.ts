/** @generated from client-certificate-for-a-zone-put-hostname-associations */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/certificate_authorities/hostname_associations`,
	body: "json",
} as const;
