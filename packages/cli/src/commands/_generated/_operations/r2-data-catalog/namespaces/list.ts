/** @generated from r2-data-catalog.namespaces.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/r2-catalog/{bucket_name}/namespaces",
	query: [
		"page_token",
		"page_size",
		"parent",
		"return_uuids",
		"return_details",
	],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
