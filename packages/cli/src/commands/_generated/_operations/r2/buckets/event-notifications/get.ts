/** @generated from r2.buckets.event-notifications.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/event_notifications/r2/{bucket_name}/configuration/queues/{queue_id}",
	headers: ["cf-r2-jurisdiction"],
	errors: {
		404: "NotFoundError",
	},
} as const;
