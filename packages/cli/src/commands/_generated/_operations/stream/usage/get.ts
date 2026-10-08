/** @generated from stream.usage.get */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/stream/usage",
	query: ["metrics", "since", "until", "time_delta", "limit", "filters"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
