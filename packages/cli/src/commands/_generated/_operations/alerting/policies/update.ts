/** @generated from notification-policies-update-a-notification-policy */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/policies/${request.policy_id}`,
	body: "json",
} as const;
