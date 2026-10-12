/** @generated from user.firewall.access-rules.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/user/firewall/access_rules/rules/${request.rule_id}`,
	body: "json",
} as const;
