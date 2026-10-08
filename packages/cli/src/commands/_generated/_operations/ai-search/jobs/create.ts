/** @generated from ai-search.jobs.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/jobs",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		503: "ServiceUnavailableError",
	},
} as const;
