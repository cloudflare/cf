/** @generated from zero-trust-accounts-patch-device-settings-for-the-zero-trust-account */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/settings`,
	body: "json",
} as const;
