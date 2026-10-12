/** @generated from account-subscriptions-delete-subscription */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/subscriptions/${request.subscription_identifier}`,
} as const;
