/** @generated from notification-policies-get-a-notification-policy */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/policies/${request.policy_id}`,
} as const;
