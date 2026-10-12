/** @generated from ip-access-rules-for-a-user-update-an-ip-access-rule */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/user/firewall/access_rules/rules/${request.rule_id}`,
	body: "json",
} as const;
