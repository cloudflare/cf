/** @generated from account-subscriptions-update-subscription */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/subscriptions/${request.subscription_identifier}`,
	body: "json",
} as const;
