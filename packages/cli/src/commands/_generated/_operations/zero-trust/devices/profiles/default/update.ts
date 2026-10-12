/** @generated from devices-update-default-device-settings-policy */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policy`,
	body: "json",
} as const;
