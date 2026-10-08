/** @generated from artifacts.namespaces.repos.commits.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/repos/{name}/commit/{hash}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
