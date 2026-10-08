/** @generated from analytics.query.data-security.findings.summary */
export default {
	method: "POST",
	path: "/accounts/{account_id}/analytics/query/data-security/findings/summary",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
