/** @generated from mcp-portals-api-fetch-servers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/ai-controls/mcp/servers/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
