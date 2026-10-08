/** @generated from o11y.tracing.rules.delete */
export default {
	method: "DELETE",
	path: "/zones/{zone_id}/observability/tracing/rules",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
