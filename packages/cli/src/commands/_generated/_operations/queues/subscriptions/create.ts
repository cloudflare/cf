/** @generated from queues.subscriptions.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/event_subscriptions/subscriptions",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		405: "MethodNotAllowedError",
	},
} as const;
