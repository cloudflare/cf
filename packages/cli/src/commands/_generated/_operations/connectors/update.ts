/** @generated from connectors.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/magic/connectors/{connector_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
