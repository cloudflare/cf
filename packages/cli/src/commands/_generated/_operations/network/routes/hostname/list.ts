/** @generated from network.routes.hostname.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/routes/hostname`,
	query: [
		"id",
		"hostname",
		"tunnel_id",
		"comment",
		"existed_at",
		"is_deleted",
		"per_page",
		"page",
	],
} as const;
