/** @generated from artifacts.namespaces.tokens.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/tokens",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
