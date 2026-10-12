/** @generated from cloudforce-one.threat-signals.articles.tags.add */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/articles/${request.article_id}/tags`,
	body: "json",
} as const;
