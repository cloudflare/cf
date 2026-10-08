/** @generated from dls.regional-services.prefix-bindings.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/dls/regional_services/prefix_bindings/{binding_id}",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
