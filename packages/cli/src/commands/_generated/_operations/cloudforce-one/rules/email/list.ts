/** @generated from cloudforce-one.rules.email.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/rules/structured",
	query: ["limit", "offset", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
