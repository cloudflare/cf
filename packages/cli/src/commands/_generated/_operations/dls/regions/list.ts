/** @generated from dls.regions.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/dls/regions",
	query: ["cursor", "per_page", "type"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
