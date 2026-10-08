/** @generated from flagship.apps.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/flagship/apps/{app_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
