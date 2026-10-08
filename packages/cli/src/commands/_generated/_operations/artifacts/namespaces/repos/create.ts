/** @generated from artifacts.namespaces.repos.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/repos",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
