/** @generated from r2-data-catalog.credentials.status */
export default {
	method: "GET",
	path: "/accounts/{account_id}/r2-catalog/{bucket_name}/credential/status",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
