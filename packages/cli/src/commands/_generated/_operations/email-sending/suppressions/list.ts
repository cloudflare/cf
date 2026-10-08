/** @generated from email-sending.suppressions.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/email/sending/suppressions",
	query: [
		"per_page",
		"cursor",
		"email",
		"search",
		"reason",
		"scope_type",
		"scope_value",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
