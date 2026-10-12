/** @generated from rssSkillUpdate */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/skills/${request.skill_id}`,
	body: "json",
} as const;
