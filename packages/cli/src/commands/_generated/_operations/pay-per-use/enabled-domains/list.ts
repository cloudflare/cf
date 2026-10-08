/** @generated from pay-per-use.enabled-domains.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/pay-per-use/enabled-domains",
	query: ["cursor", "per_page"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
