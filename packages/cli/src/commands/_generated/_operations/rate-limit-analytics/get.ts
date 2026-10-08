/** @generated from rate-limit-analytics.get */
export default {
	method: "GET",
	path: "/zones/{zone_id}/rate_limit_analytics",
	query: ["since", "until", "time_delta"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
