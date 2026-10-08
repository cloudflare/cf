/** @generated from artifacts.namespaces.repos.raw.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/repos/{name}/raw/{ref}/{path}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		413: "ContentTooLargeError",
		500: "InternalServerError",
	},
} as const;
