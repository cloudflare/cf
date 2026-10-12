/** @generated from user-agent-blocking-rules-list-user-agent-blocking-rules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/firewall/ua_rules`,
	query: ["page", "description", "per_page", "user_agent", "paused"],
} as const;
