/** @generated from r2.objects.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/objects`,
	query: ["per_page", "prefix", "delimiter", "cursor", "start_after"],
	headers: ["cf-r2-jurisdiction"],
} as const;
