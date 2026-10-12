/** @generated from rssSkillList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/skills`,
	query: ["page", "per_page"],
} as const;
