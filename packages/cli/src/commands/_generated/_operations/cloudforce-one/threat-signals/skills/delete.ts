/** @generated from cloudforce-one.threat-signals.skills.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/skills/${request.skill_id}`,
} as const;
