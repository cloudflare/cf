/** @generated from containers.registries.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/containers/registries/{domain}",
	errors: {
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
