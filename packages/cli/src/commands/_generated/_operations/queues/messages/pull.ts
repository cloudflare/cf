/** @generated from queues-pull-messages */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/queues/${request.queue_id}/messages/pull`,
	body: "json",
} as const;
