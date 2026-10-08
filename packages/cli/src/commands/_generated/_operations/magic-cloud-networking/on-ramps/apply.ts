/** @generated from magic-cloud-networking.on-ramps.apply */
export default {
	method: "POST",
	path: "/accounts/{account_id}/magic/cloud/onramps/{onramp_id}/apply",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
