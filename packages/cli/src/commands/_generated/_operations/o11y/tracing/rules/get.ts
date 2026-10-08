/** @generated from o11y.tracing.rules.get */
export default {
	method: "GET",
	path: "/zones/{zone_id}/observability/tracing/rules",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
