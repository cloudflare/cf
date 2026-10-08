/** @generated from realtime.kit.webhooks.replace */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/webhooks/{webhook_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
