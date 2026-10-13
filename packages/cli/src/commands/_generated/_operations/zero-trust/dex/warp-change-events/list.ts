/** @generated from zero-trust.dex.warp-change-events.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/warp-change-events`,
	query: [
		"page",
		"per_page",
		"from",
		"to",
		"type",
		"toggle",
		"config_name",
		"account_name",
		"sort_order",
	],
} as const;
