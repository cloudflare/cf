/** @generated from flagship.apps.evaluate.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/flagship/apps/{app_id}/evaluate",
	query: ["flagKey", "targetingKey"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
