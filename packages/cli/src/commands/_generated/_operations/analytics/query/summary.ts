/** @generated from analytics.query.summary */
export default {
	method: "POST",
	path: "/accounts/{account_id}/analytics/query/{dataset}/summary",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
