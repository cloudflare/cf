/** @generated from artifacts.namespaces.repos.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/repos/{name}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
