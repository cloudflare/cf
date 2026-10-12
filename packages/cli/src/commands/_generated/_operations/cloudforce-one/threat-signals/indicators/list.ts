/** @generated from rssArticleIndicatorList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/indicators`,
	query: [
		"feed_id",
		"article_id",
		"search",
		"per_page",
		"sort",
		"include_total",
		"cursor",
	],
} as const;
