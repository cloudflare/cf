/** @generated from client-certificate-for-a-zone-delete-client-certificate */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/client_certificates/${request.client_certificate_id}`,
} as const;
