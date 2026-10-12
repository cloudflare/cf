/** @generated from keyless-ssl-for-a-zone-delete-keyless-ssl-configuration */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/keyless_certificates/${request.keyless_certificate_id}`,
} as const;
