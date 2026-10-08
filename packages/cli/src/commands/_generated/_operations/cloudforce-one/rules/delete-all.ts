/** @generated from cloudforce-one.rules.delete-all */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/rules",
	errors: {
		401: "UnauthorizedError",
		409: "ConflictError",
	},
} as const;
