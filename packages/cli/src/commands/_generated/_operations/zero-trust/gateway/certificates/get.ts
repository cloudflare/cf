/** @generated from zero-trust.gateway.certificates.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/certificates/${request.certificate_id}`,
} as const;
