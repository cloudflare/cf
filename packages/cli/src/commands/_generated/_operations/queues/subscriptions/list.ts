/** @generated from queues.subscriptions.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/event_subscriptions/subscriptions`,
	query: ["page", "per_page", "order", "direction"],
} as const;
