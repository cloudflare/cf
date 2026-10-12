/** @generated from zero-trust-accounts-get-device-settings-for-zero-trust-account */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/settings`,
} as const;
