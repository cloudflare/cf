/** @generated from dls.regional-services.prefix-bindings.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/dls/regional_services/prefix_bindings",
	query: ["cursor", "per_page"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
