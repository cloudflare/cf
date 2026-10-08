/** @generated from r2.buckets.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/r2/buckets",
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
