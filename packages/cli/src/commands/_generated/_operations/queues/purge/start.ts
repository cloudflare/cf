/** @generated from queues.purge.start */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/queues/${request.queue_id}/purge`,
	body: "json",
} as const;
