/** @generated from analytics.query.data-security.findings.timeseries */
export default {
	method: "POST",
	path: "/accounts/{account_id}/analytics/query/data-security/findings/timeseries",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
