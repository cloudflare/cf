/** @generated from cloudforce-one.threat-signals.skills.tag-categories.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/skills/${request.skill_id}/tag-categories`,
} as const;
