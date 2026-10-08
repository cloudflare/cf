/** @generated from o11y.tracing.settings.update */
export default {
	method: "PATCH",
	path: "/zones/{zone_id}/observability/tracing/settings",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
