/** @generated from artifacts.namespaces.repos.tokens.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/repos/{name}/tokens",
	query: ["state", "page", "per_page"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
