/** @generated from magic-cloud-networking.catalog-syncs.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/magic/cloud/catalog-syncs/{sync_id}",
	query: ["delete_destination"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
