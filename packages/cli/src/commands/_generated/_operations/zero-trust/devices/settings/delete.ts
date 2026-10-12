/** @generated from zero-trust-accounts-delete-device-settings-for-zero-trust-account */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/settings`,
} as const;
