/** @generated from r2.objects.bulk-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/objects`,
	query: ["prefix"],
	headers: ["cf-r2-jurisdiction", "cf-r2-data-catalog-check"],
	body: "json",
} as const;
