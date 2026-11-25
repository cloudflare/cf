/** @generated from cloudforce-one.threat-signals.articles.skills.run */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/articles/${request.article_id}/skills/${request.skill_id}/run`,
	body: "json",
	errors: {
		403: "ForbiddenError",
	},
} as const;
