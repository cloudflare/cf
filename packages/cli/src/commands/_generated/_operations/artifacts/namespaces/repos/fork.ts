/** @generated from artifacts.namespaces.repos.fork */
export default {
	method: "POST",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/repos/{name}/fork",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
