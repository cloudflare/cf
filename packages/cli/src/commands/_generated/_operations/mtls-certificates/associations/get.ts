/** @generated from m-tls-certificate-management-list-m-tls-certificate-associations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mtls_certificates/${request.mtls_certificate_id}/associations`,
} as const;
