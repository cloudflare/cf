/** @generated from subscriptions-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/event_subscriptions/subscriptions/${request.subscription_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
