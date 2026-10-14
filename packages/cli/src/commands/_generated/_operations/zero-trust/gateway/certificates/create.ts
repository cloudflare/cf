/** @generated from zero-trust.gateway.certificates.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/certificates`,
	body: "json",
} as const;
