/** @generated from accounts.applications.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/resource-library/applications",
	query: [
		"filter",
		"limit",
		"offset",
		"order_by",
		"search",
		"lookup",
		"fields",
	],
	errors: {
		403: "ForbiddenError",
		502: "BadGatewayError",
		503: "ServiceUnavailableError",
	},
} as const;
