/** @generated from cloudforce-one.threat-signals.articles.reprocess */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/articles/${request.article_id}/reprocess`,
	body: "json",
	errors: {
		403: "ForbiddenError",
	},
} as const;
