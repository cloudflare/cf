/** @generated from r2-get-bucket-local-uploads-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/local-uploads`,
} as const;
