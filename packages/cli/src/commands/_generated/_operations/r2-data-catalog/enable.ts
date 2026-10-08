/** @generated from r2-data-catalog.enable */
export default {
	method: "POST",
	path: "/accounts/{account_id}/r2-catalog/{bucket_name}/enable",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
