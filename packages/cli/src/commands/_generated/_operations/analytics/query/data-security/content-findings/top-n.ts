/** @generated from analytics.query.data-security.content-findings.top-n */
export default {
	method: "POST",
	path: "/accounts/{account_id}/analytics/query/data-security/content-findings/top-n",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
