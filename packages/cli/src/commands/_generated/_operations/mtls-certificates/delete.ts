/** @generated from m-tls-certificate-management-delete-m-tls-certificate */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mtls_certificates/${request.mtls_certificate_id}`,
} as const;
