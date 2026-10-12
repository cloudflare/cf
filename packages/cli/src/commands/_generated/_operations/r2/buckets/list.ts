/** @generated from r2.buckets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/buckets`,
	query: [
		"name_contains",
		"start_after",
		"per_page",
		"order",
		"direction",
		"cursor",
	],
	headers: ["cf-r2-jurisdiction"],
} as const;
