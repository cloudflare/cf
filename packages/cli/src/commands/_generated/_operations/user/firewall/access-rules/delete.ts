/** @generated from ip-access-rules-for-a-user-delete-an-ip-access-rule */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/user/firewall/access_rules/rules/${request.rule_id}`,
} as const;
