/** @generated from cloudforce-one.rules.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/rules/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
