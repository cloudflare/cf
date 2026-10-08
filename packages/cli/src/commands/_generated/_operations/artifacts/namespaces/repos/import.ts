/** @generated from artifacts.namespaces.repos.import */
export default {
	method: "POST",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/repos/{name}/import",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		413: "ContentTooLargeError",
		422: "UnprocessableEntityError",
		500: "InternalServerError",
		502: "BadGatewayError",
		503: "ServiceUnavailableError",
		504: "GatewayTimeoutError",
	},
} as const;
