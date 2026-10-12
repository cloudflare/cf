/** @generated from custom-ssl-for-a-zone-delete-ssl-configuration */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates/${request.custom_certificate_id}`,
} as const;
