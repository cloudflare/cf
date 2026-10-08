/** @generated from r2-data-catalog.delete */
export default {
	method: "POST",
	path: "/accounts/{account_id}/r2-catalog/{bucket_name}/delete",
	query: ["force"],
	response: false,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
