/** @generated from r2-add-custom-domain */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets/${request.bucket_name}/domains/custom`,
	headers: ["cf-r2-jurisdiction"],
	body: "json",
} as const;
