/** @generated from r2.buckets.domains.managed.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/domains/managed`,
	headers: ["cf-r2-jurisdiction"],
	body: "json",
} as const;
