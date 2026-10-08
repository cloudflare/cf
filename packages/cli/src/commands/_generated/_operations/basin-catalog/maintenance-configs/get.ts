/** @generated from basin-catalog.maintenance-configs.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/basin-catalog/{bucket_name}/maintenance-configs",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
