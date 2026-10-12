/** @generated from r2.buckets.local-uploads.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/local-uploads`,
	body: "json",
} as const;
