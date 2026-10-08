/** @generated from analytics.query.timeseries */
export default {
	method: "POST",
	path: "/accounts/{account_id}/analytics/query/{dataset}/timeseries",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
