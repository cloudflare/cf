/** @generated from realtime.kit.webhooks.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/realtime/kit/{app_id}/webhooks/{webhook_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
