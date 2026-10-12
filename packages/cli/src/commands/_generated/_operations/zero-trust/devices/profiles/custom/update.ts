/** @generated from devices-update-device-settings-policy */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policy/${request.policy_id}`,
	body: "json",
} as const;
