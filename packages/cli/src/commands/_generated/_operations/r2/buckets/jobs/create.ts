/** @generated from r2.buckets.jobs.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/r2/buckets/{bucket_name}/jobs",
	headers: ["cf-r2-jurisdiction", "cf-r2-data-catalog-check"],
	body: "json",
	errors: {
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
