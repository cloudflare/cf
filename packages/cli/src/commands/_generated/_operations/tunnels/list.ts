/** @generated from tunnels.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tunnels`,
	query: [
		"name",
		"is_deleted",
		"existed_at",
		"uuid",
		"was_active_at",
		"was_inactive_at",
		"include_prefix",
		"exclude_prefix",
		"tun_types",
		"status",
		"per_page",
		"page",
	],
} as const;
