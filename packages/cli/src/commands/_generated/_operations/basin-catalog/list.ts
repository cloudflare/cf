/** @generated from basin-catalog.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/basin-catalog",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
