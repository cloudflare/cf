/** @generated from cloudforce-one.rules.email.test */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/rules/structured/{id}/test",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
