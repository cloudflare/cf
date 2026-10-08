/** @generated from r2-data-catalog.disable */
export default {
	method: "POST",
	path: "/accounts/{account_id}/r2-catalog/{bucket_name}/disable",
	response: false,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
