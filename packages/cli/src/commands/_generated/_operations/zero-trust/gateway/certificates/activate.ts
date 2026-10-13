/** @generated from zero-trust.gateway.certificates.activate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/certificates/${request.certificate_id}/activate`,
} as const;
