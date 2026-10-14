/** @generated from ai.models.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/models/search`,
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
