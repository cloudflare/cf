/** @generated from cloudforce-one.threat-signals.articles.aggregate-relevance */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/articles/relevance/aggregate`,
	query: ["published_after", "published_before"],
} as const;
