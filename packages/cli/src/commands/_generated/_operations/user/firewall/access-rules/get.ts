/** @generated from ip-access-rules-for-a-user-get-an-ip-access-rule */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/firewall/access_rules/rules/${request.rule_id}`,
} as const;
