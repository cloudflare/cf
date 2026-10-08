/** @generated from realtime.kit.webhooks.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/webhooks/{webhook_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
