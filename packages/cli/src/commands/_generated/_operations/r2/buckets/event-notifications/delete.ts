/** @generated from r2.buckets.event-notifications.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/event_notifications/r2/${request.bucket_name}/configuration/queues/${request.queue_id}`,
	headers: ["cf-r2-jurisdiction"],
	body: "json",
} as const;
