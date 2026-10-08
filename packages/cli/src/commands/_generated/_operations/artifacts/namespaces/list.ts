/** @generated from artifacts.namespaces.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/artifacts/namespaces",
	query: ["limit", "cursor"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
