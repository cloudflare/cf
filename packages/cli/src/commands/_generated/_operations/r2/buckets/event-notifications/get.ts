/** @generated from r2.buckets.event-notifications.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/event_notifications/r2/${request.bucket_name}/configuration/queues/${request.queue_id}`,
	headers: ["cf-r2-jurisdiction"],
	errors: {
		404: "NotFoundError",
	},
} as const;
