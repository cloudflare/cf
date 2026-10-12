/** @generated from keyless-ssl-for-a-zone-get-keyless-ssl-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/keyless_certificates/${request.keyless_certificate_id}`,
} as const;
