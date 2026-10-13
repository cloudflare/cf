/** @generated from zero-trust.devices.profiles.custom.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policy/${request.policy_id}`,
} as const;
