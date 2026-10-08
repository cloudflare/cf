/** @generated from workflows.concurrency.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/workflows/concurrency/{key_id}",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
