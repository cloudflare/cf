/** @generated from shares-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/shares`,
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
