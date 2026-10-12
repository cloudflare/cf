/** @generated from client-certificate-for-a-zone-client-certificate-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/client_certificates/${request.client_certificate_id}`,
} as const;
