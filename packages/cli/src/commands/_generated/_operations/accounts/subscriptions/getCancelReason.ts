/** @generated from account-subscriptions-get-cancel-reason */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/subscriptions/${request.subscription_identifier}/cancel-reason`,
} as const;
