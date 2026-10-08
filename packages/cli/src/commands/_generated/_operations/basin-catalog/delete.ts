/** @generated from basin-catalog.delete */
export default {
	method: "POST",
	path: "/accounts/{account_id}/basin-catalog/{bucket_name}/delete",
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
