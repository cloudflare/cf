/** @generated from mcp.servers.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/access/ai-controls/mcp/servers",
	query: ["page", "per_page", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
