/** @generated from analytics.query.top-n */
export default {
	method: "POST",
	path: "/accounts/{account_id}/analytics/query/{dataset}/top-n",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
