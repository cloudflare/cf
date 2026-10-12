/** @generated from mcp.servers.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/ai-controls/mcp/servers`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
