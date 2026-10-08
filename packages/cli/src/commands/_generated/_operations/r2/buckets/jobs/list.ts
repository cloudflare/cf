/** @generated from r2.buckets.jobs.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/r2/buckets/{bucket_name}/jobs",
	query: ["jobType", "status", "maxKeys", "continuationToken"],
	headers: ["cf-r2-jurisdiction"],
} as const;
