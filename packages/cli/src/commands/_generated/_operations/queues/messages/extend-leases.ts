/** @generated from queues-extend-messages */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/queues/${request.queue_id}/messages/extend`,
	body: "json",
} as const;
