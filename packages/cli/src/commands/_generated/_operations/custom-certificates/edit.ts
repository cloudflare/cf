/** @generated from custom-ssl-for-a-zone-edit-ssl-configuration */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates/${request.custom_certificate_id}`,
	body: "json",
} as const;
