/** @generated from keyless-ssl-for-a-zone-edit-keyless-ssl-configuration */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/keyless_certificates/${request.keyless_certificate_id}`,
	body: "json",
} as const;
