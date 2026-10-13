/** @generated from firewall.ua-rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/ua_rules/${request.ua_rule_id}`,
} as const;
