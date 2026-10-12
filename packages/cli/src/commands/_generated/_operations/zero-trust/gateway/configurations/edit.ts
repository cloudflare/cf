/** @generated from zero-trust-accounts-patch-zero-trust-account-configuration */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/configuration`,
	body: "json",
} as const;
