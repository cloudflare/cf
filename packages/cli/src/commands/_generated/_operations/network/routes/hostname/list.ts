/** @generated from network.routes.hostname.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/zerotrust/routes/hostname",
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
