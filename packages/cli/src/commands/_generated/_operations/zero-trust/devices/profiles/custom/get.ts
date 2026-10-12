/** @generated from devices-get-device-settings-policy-by-id */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policy/${request.policy_id}`,
} as const;
