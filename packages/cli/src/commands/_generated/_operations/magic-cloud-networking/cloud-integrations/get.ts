/** @generated from magic-cloud-networking.cloud-integrations.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/cloud/providers/{provider_id}",
	query: ["status"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
