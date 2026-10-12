/** @generated from mcp-portals-api-delete-servers */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/ai-controls/mcp/servers/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
