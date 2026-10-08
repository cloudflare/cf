/** @generated from artifacts.namespaces.repos.logs.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/repos/{name}/log",
	query: ["ref", "limit", "offset"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
