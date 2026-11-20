/** @generated from r2.buckets.domains.custom.delete-legacy */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/custom_domains/${request.domain}`,
	headers: ["cf-r2-jurisdiction"],
} as const;
