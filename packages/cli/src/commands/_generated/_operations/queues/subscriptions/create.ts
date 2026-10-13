/** @generated from queues.subscriptions.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/event_subscriptions/subscriptions`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		405: "MethodNotAllowedError",
	},
} as const;
