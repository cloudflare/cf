/** @generated from notification-policies-test-a-notification-policy */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/policies/${request.policy_id}/test`,
	body: "json",
} as const;
