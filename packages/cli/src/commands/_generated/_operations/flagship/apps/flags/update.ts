/** @generated from flagship.apps.flags.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/flagship/apps/{app_id}/flags/{flag_key}",
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
