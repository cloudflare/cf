/** @generated from zero-trust-accounts-get-connectivity-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/connectivity_settings`,
} as const;
