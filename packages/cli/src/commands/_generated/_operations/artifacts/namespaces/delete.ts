/** @generated from artifacts.namespaces.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}",
	response: false,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
