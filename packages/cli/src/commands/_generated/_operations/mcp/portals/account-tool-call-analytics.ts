/** @generated from mcp-portals-api-account-tool-call-timeseries */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/ai-controls/mcp/analytics/tool-calls/timeseries`,
	query: ["granularity", "aggregate", "tz", "days"],
	errors: {
		400: "BadRequestError",
	},
} as const;
