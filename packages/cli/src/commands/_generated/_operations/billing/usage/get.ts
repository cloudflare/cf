/** @generated from billing.usage.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/billing/usage",
	query: ["metrics", "since", "until", "time_delta", "limit", "filters"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
