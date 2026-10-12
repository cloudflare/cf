/** @generated from r2.buckets.sippy.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/sippy`,
	headers: ["cf-r2-jurisdiction"],
	body: "json",
} as const;
