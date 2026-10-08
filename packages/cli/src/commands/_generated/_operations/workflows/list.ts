/** @generated from workflows.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows",
	query: ["per_page", "page", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
