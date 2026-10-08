/** @generated from ai-audit.robots.bulk-get */
export default {
	method: "POST",
	path: "/zones/{zone_id}/ai-audit/robots/bulk",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		408: "RequestTimeoutError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
