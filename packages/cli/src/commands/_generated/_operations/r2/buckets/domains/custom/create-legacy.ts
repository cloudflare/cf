/** @generated from r2.buckets.domains.custom.create-legacy */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/custom_domains`,
	headers: ["cf-r2-jurisdiction"],
	body: "json",
} as const;
