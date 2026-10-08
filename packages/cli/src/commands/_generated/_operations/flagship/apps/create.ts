/** @generated from flagship.apps.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/flagship/apps",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
