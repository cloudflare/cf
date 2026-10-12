/** @generated from mcp-portals-api-server-tool-call-timeseries */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/ai-controls/mcp/analytics/servers/${request.server_id}/tool-calls/timeseries`,
	query: ["granularity", "aggregate", "tz", "days"],
	errors: {
		400: "BadRequestError",
	},
} as const;
