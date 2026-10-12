/** @generated from audit-logs.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/audit_logs`,
	query: [
		"id",
		"export",
		"action.type",
		"actor.ip",
		"actor.email",
		"since",
		"before",
		"zone.name",
		"direction",
		"per_page",
		"page",
		"hide_user_logs",
	],
} as const;
