/** @generated from magic-cloud-networking.catalog-syncs.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/cloud/catalog-syncs/{sync_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
