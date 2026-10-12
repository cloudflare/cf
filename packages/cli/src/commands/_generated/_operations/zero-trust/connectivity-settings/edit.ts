/** @generated from zero-trust-accounts-patch-connectivity-settings */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/connectivity_settings`,
	body: "json",
} as const;
