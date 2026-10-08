/** @generated from magic-cloud-networking.on-ramps.edit */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/magic/cloud/onramps/{onramp_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		422: "UnprocessableEntityError",
		500: "InternalServerError",
	},
} as const;
