/** @generated from cloudforce-one.threat-signals.skills.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/skills`,
	body: "json",
} as const;
