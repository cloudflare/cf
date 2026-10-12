/** @generated from devices-delete-device-settings-policy */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policy/${request.policy_id}`,
} as const;
