/** @generated from realtime.kit.webhooks.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/webhooks/{webhook_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
