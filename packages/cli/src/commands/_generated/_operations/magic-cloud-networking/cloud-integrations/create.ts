/** @generated from magic-cloud-networking.cloud-integrations.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/magic/cloud/providers",
	headers: ["forwarded"],
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		409: "ConflictError",
		422: "UnprocessableEntityError",
		500: "InternalServerError",
	},
} as const;
