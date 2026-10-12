/** @generated from zero-trust-accounts-get-zero-trust-account-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/configuration`,
} as const;
