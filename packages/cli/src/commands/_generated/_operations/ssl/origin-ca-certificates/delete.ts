/** @generated from ssl.origin-ca-certificates.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/certificates/${request.certificate_id}`,
} as const;
