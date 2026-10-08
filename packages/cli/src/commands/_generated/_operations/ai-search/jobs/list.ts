/** @generated from ai-search.jobs.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/jobs",
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
