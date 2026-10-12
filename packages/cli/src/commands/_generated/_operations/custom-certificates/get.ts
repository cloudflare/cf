/** @generated from custom-certificates.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates/${request.custom_certificate_id}`,
} as const;
