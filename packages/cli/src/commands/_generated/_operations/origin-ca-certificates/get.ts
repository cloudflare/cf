/** @generated from origin-ca-get-certificate */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/certificates/${request.certificate_id}`,
} as const;
