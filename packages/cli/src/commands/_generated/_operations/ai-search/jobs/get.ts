/** @generated from ai-search.jobs.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/jobs/{job_id}",
	errors: {
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
