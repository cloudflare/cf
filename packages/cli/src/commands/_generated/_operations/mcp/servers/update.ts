/** @generated from mcp.servers.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/access/ai-controls/mcp/servers/{id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
