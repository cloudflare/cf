/** @generated from cloudforce-one.rules.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/rules",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
