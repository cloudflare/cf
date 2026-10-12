/** @generated from user-agent-blocking-rules-get-a-user-agent-blocking-rule */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/ua_rules/${request.ua_rule_id}`,
} as const;
