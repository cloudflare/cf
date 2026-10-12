/** @generated from r2-get-bucket-lifecycle-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/lifecycle`,
	headers: ["cf-r2-jurisdiction"],
} as const;
