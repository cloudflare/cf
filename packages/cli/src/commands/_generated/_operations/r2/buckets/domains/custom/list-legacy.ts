/** @generated from r2.buckets.domains.custom.list-legacy */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/custom_domains`,
	headers: ["cf-r2-jurisdiction"],
} as const;
