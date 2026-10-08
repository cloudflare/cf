/** @generated from cloudforce-one.rules.email.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/rules/structured",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
