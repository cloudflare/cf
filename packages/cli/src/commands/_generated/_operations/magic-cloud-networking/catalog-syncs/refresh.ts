/** @generated from magic-cloud-networking.catalog-syncs.refresh */
export default {
	method: "POST",
	path: "/accounts/{account_id}/magic/cloud/catalog-syncs/{sync_id}/refresh",
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
