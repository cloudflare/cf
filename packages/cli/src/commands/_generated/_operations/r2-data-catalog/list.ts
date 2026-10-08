/** @generated from r2-data-catalog.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/r2-catalog",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
