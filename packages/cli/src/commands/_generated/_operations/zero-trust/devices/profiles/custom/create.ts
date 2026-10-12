/** @generated from devices-create-device-settings-policy */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policy`,
	body: "json",
} as const;
