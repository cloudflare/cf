/** @generated from flagship.apps.flags.evaluate */
export default {
	method: "POST",
	path: "/accounts/{account_id}/flagship/apps/{app_id}/evaluate",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
