/** @generated from flagship.apps.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/flagship/apps",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
