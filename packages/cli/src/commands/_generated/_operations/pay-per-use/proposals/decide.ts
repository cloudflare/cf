/** @generated from pay-per-use.proposals.decide */
export default {
	method: "POST",
	path: "/accounts/{account_id}/pay-per-use/proposals",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
