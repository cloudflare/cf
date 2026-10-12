/** @generated from r2.buckets.jobs.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/jobs`,
	query: ["jobType", "status", "maxKeys", "continuationToken"],
	headers: ["cf-r2-jurisdiction"],
} as const;
