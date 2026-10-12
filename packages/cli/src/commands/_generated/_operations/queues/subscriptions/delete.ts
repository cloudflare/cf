/** @generated from queues.subscriptions.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/event_subscriptions/subscriptions/${request.subscription_id}`,
} as const;
