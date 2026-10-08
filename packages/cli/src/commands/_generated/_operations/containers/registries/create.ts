/** @generated from containers.registries.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/containers/registries",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
