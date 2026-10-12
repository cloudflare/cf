/** @generated from zero-trust-certificates-list-zero-trust-certificates */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/certificates`,
} as const;
