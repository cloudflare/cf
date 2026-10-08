/** @generated from magic-cloud-networking.cloud-integrations.discover */
export default {
	method: "POST",
	path: "/accounts/{account_id}/magic/cloud/providers/{provider_id}/discover",
	query: ["v2"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
