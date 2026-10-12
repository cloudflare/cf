/** @generated from m-tls-certificate-management-upload-m-tls-certificate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mtls_certificates`,
	body: "json",
} as const;
