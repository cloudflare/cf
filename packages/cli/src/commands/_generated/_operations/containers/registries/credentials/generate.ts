/** @generated from containers.registries.credentials.generate */
export default {
	method: "POST",
	path: "/accounts/{account_id}/containers/registries/{domain}/credentials",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
