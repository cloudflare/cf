/** @generated from zero-trust-certificates-zero-trust-certificate-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/certificates/${request.certificate_id}`,
} as const;
