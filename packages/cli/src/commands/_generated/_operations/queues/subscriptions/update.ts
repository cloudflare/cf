/** @generated from queues.subscriptions.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/event_subscriptions/subscriptions/{subscription_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
