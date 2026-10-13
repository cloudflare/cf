/** @generated from user.audit-logs.list */
export default {
	method: "GET",
	path: () => "/user/audit_logs",
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
