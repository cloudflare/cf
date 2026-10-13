/** @generated from r2.buckets.jobs.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/jobs`,
	headers: ["cf-r2-jurisdiction", "cf-r2-data-catalog-check"],
	body: "json",
	errors: {
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
