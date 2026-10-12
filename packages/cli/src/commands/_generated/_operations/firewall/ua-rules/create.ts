/** @generated from user-agent-blocking-rules-create-a-user-agent-blocking-rule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/ua_rules`,
	body: "json",
} as const;
