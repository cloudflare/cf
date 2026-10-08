/** @generated from cloudforce-one.rules.email.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/rules/structured/{id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
