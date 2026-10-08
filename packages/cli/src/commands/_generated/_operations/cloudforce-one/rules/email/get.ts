/** @generated from cloudforce-one.rules.email.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/rules/structured/{id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
