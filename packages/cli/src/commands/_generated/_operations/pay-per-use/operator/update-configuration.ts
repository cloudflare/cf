/** @generated from pay-per-use.operator.update-configuration */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/pay-per-use/operator/configuration",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
