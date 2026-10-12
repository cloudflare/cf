/** @generated from r2.buckets.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}`,
	headers: ["cf-r2-jurisdiction", "cf-r2-storage-class"],
} as const;
