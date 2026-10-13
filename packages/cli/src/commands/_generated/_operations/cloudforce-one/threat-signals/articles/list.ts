/** @generated from cloudforce-one.threat-signals.articles.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/articles`,
	query: [
		"cursor",
		"per_page",
		"feed_id",
		"article_id",
		"read",
		"tag_id",
		"tag_category_id",
		"tag",
		"tag_category",
		"include_total",
		"search",
		"published_after",
		"published_before",
		"fetched_after",
		"fetched_before",
		"feed_category",
		"source_type",
		"tag_applied_by",
		"sort",
	],
} as const;
