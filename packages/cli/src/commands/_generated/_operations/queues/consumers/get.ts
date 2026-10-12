/** @generated from queues-get-consumer */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/queues/${request.queue_id}/consumers/${request.consumer_id}`,
} as const;
