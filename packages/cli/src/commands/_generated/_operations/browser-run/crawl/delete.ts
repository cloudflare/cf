/** @generated from browser-run.crawl.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/browser-rendering/crawl/{job_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
