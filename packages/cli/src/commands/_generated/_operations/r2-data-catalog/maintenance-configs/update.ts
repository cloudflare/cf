/** @generated from r2-data-catalog.maintenance-configs.update */
export default {
	method: "POST",
	path: "/accounts/{account_id}/r2-catalog/{bucket_name}/maintenance-configs",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
