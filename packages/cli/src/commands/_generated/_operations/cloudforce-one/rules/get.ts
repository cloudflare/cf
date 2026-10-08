/** @generated from cloudforce-one.rules.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/rules/{id}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
