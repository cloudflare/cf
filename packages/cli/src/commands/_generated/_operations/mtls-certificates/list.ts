/** @generated from m-tls-certificate-management-list-m-tls-certificates */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mtls_certificates`,
	query: ["type"],
	joined: ["type"],
} as const;
