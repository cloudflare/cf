/** @generated from cloudforce-one.threat-signals.skills.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/skills/${request.skill_id}`,
} as const;
