/** @generated from r2.objects.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/objects/${request.object_key}`,
	headers: ["cf-r2-jurisdiction"],
} as const;
