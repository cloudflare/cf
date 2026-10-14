/** @generated from user.firewall.access-rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/firewall/access_rules/rules/${request.rule_id}`,
} as const;
