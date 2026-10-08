/** @generated from magic-cloud-networking.resources.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/cloud/resources/{resource_id}",
	query: ["v2"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
