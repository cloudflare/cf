/** @generated from account-subscriptions-create-cancel-reason */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/subscriptions/${request.subscription_identifier}/cancel-reason`,
	body: "json",
} as const;
