/** @generated from devices-get-default-device-settings-policy */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policy`,
} as const;
