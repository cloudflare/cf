/** @generated from zero-trust-certificates-create-zero-trust-certificate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/certificates`,
	body: "json",
} as const;
