/** @generated from ai-audit.robots.get */
export default {
	method: "GET",
	path: "/zones/{zone_id}/ai-audit/robots",
	query: ["subdomain"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
