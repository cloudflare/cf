/** @generated from zero-trust-certificates-delete-zero-trust-certificate */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/certificates/${request.certificate_id}`,
} as const;
