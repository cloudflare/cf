/** @generated from connectors.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/connectors",
	query: ["device_type"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
