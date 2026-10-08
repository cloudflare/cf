/** @generated from pay-per-use.proposals.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/pay-per-use/proposals",
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
