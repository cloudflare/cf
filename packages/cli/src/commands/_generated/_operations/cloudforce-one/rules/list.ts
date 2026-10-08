/** @generated from cloudforce-one.rules.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/rules",
	query: [
		"namespace",
		"path",
		"recursive",
		"search",
		"is_public",
		"limit",
		"offset",
	],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
