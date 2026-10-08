/** @generated from r2.buckets.event-notifications.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/event_notifications/r2/{bucket_name}/configuration",
	headers: ["cf-r2-jurisdiction"],
	errors: {
		404: "NotFoundError",
	},
} as const;
