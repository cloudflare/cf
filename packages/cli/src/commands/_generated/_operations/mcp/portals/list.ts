/** @generated from mcp.portals.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/ai-controls/mcp/portals`,
	query: ["page", "per_page", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
