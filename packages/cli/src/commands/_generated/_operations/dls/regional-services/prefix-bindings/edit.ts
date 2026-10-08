/** @generated from dls.regional-services.prefix-bindings.edit */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/dls/regional_services/prefix_bindings/{binding_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
