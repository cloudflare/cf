/** @generated from r2-get-bucket-lock-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/lock`,
	headers: ["cf-r2-jurisdiction"],
} as const;
