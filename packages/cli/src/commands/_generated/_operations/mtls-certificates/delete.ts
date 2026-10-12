/** @generated from mtls-certificates.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mtls_certificates/${request.mtls_certificate_id}`,
} as const;
