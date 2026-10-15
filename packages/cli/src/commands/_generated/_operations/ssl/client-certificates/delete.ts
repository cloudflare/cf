/** @generated from ssl.client-certificates.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/client_certificates/${request.client_certificate_id}`,
} as const;
