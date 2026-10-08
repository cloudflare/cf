/** @generated from ai.models.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/ai/models/search",
	query: [
		"per_page",
		"page",
		"task",
		"author",
		"source",
		"hide_experimental",
		"search",
		"include_deprecated",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
