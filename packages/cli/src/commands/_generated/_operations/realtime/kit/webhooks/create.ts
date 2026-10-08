/** @generated from realtime.kit.webhooks.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/webhooks",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
