/** @generated from r2-create-bucket */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets`,
	headers: ["cf-r2-jurisdiction"],
	body: "json",
} as const;
