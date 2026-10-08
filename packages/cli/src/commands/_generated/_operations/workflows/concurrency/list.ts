/** @generated from workflows.concurrency.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows/concurrency",
	query: ["per_page", "page"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
	},
} as const;
