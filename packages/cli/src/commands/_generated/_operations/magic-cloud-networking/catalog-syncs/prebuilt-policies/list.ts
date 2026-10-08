/** @generated from magic-cloud-networking.catalog-syncs.prebuilt-policies.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/cloud/catalog-syncs/prebuilt-policies",
	query: ["destination_type"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
