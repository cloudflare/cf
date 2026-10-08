/** @generated from ai-search.jobs.cancel */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/ai-search/namespaces/{name}/instances/{id}/jobs/{job_id}",
	body: "json",
	constants: {
		action: "cancel",
	},
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
