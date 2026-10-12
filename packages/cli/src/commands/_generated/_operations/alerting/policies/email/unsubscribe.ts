/** @generated from alerting.policies.email.unsubscribe */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/policies/${request.policy_id}/email/unsubscribe`,
	query: ["email", "token"],
} as const;
