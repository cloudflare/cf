/** @generated from queues.consumers.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/queues/${request.queue_id}/consumers/${request.consumer_id}`,
	body: "json",
} as const;
