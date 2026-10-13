/** @generated from cloudforce-one.threat-signals.articles.bulk-mark-read */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/articles`,
	body: "json",
} as const;
