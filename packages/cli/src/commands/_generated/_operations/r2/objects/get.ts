/** @generated from r2-get-object */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/objects/${request.object_key}`,
	headers: ["cf-r2-jurisdiction", "If-None-Match", "If-Modified-Since"],
	response: "binary-response",
} as const;
