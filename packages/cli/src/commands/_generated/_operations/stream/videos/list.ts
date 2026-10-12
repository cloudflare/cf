/** @generated from stream-videos-list-videos */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream`,
	query: [
		"status",
		"creator",
		"type",
		"asc",
		"video_name",
		"search",
		"start",
		"end",
		"include_counts",
		"id",
		"name",
		"live_input_id",
		"before",
		"after",
		"limit",
	],
} as const;
