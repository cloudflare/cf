/** @generated from artifacts.namespaces.tokens.revoke */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/artifacts/namespaces/{namespace}/tokens/{id}",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
