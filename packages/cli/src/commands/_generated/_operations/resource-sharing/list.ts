/** @generated from resource-sharing.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/shares",
	query: [
		"status",
		"kind",
		"target_type",
		"resource_types",
		"order",
		"direction",
		"page",
		"per_page",
		"include_resources",
		"include_recipient_counts",
		"tag",
	],
} as const;
