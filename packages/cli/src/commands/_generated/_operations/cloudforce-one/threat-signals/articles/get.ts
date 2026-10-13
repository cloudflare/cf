/** @generated from cloudforce-one.threat-signals.articles.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/articles/${request.article_id}`,
} as const;
