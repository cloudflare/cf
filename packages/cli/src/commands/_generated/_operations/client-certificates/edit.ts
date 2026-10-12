/** @generated from client-certificates.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/client_certificates/${request.client_certificate_id}`,
	body: "json",
} as const;
