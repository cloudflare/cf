/** @generated from o11y.tracing.rules.update */
export default {
	method: "PUT",
	path: "/zones/{zone_id}/observability/tracing/rules",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
