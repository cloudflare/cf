/** @generated from queues.messages.push */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/queues/${request.queue_id}/messages`,
	body: "json",
} as const;
