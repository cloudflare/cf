/** @generated from zero-trust-accounts-update-logging-settings-for-the-zero-trust-account */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/logging`,
	body: "json",
} as const;
