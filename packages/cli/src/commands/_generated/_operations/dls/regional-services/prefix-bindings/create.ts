/** @generated from dls.regional-services.prefix-bindings.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/dls/regional_services/prefix_bindings",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
