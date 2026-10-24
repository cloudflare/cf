/** @generated from cloudforce-one.threat-signals.articles.aggregate-severity */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/articles/severity/aggregate`,
	query: ["published_after", "published_before", "min_relevance"],
} as const;
