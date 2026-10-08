/** @generated from connector-interrupts.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/magic/connectors/{connector_id}/interrupts",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
