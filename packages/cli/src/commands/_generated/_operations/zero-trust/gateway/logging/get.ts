/** @generated from zero-trust-accounts-get-logging-settings-for-the-zero-trust-account */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/logging`,
} as const;
