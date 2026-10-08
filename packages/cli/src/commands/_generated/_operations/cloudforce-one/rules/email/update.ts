/** @generated from cloudforce-one.rules.email.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/cloudforce-one/rules/structured/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
