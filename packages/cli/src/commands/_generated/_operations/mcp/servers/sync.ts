/** @generated from mcp.servers.sync */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/ai-controls/mcp/servers/${request.id}/sync`,
	errors: {
		404: "NotFoundError",
	},
} as const;
