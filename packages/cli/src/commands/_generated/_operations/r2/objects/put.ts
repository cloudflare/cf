/** @generated from r2-put-object */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/objects/${request.object_key}`,
	headers: [
		"cf-r2-jurisdiction",
		"Content-Type",
		"Content-Length",
		"cf-r2-storage-class",
	],
	body: "json",
	contentType: "application/octet-stream",
} as const;
