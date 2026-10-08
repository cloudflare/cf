/** @generated from connector-interrupts.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/magic/connectors/{connector_id}/interrupts",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
