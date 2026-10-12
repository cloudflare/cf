/** @generated from r2.buckets.cors.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/cors`,
	headers: ["cf-r2-jurisdiction"],
} as const;
