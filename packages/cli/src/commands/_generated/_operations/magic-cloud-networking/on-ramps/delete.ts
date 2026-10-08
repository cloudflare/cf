/** @generated from magic-cloud-networking.on-ramps.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/magic/cloud/onramps/{onramp_id}",
	query: ["destroy", "force"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
