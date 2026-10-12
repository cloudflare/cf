/** @generated from zero-trust-accounts-update-zero-trust-account-configuration. */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/configuration`,
	body: "json",
} as const;
