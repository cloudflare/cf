/** @generated from magic-cloud-networking.on-ramps.export */
export default {
	method: "POST",
	path: "/accounts/{account_id}/magic/cloud/onramps/{onramp_id}/export",
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
