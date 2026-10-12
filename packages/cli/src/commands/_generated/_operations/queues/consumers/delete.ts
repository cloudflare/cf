/** @generated from queues.consumers.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/queues/${request.queue_id}/consumers/${request.consumer_id}`,
} as const;
