/** @generated from pay-per-use.operator.set-configuration */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/pay-per-use/operator/configuration",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		409: "ConflictError",
	},
} as const;
