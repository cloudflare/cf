/** @generated from cloudflare-tunnel-list-warp-connector-tunnels */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector`,
	query: [
		"name",
		"is_deleted",
		"existed_at",
		"uuid",
		"was_active_at",
		"was_inactive_at",
		"include_prefix",
		"exclude_prefix",
		"status",
		"per_page",
		"page",
	],
} as const;
