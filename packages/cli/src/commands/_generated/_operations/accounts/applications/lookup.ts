/** @generated from accounts.applications.lookup */
export default {
	method: "POST",
	path: "/accounts/{account_id}/resource-library/applications/lookup",
	query: ["filter", "limit", "fields"],
	body: "json",
	errors: {
		403: "ForbiddenError",
		502: "BadGatewayError",
		503: "ServiceUnavailableError",
	},
} as const;
