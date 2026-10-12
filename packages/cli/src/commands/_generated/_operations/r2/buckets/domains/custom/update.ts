/** @generated from r2.buckets.domains.custom.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/domains/custom/${request.domain}`,
	headers: ["cf-r2-jurisdiction"],
	body: "json",
} as const;
