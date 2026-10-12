/** @generated from cloudforce-one.threat-signals.skills.tag-categories.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/skills/${request.skill_id}/tag-categories`,
	body: "json",
} as const;
