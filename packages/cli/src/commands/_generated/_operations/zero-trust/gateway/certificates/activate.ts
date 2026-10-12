/** @generated from zero-trust-certificates-activate-zero-trust-certificate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/certificates/${request.certificate_id}/activate`,
} as const;
