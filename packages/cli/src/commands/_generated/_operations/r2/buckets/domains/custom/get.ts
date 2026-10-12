/** @generated from r2.buckets.domains.custom.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/domains/custom/${request.domain}`,
	headers: ["cf-r2-jurisdiction"],
} as const;
