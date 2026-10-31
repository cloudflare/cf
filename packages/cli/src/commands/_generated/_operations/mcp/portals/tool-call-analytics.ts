/** @generated from mcp.portals.tool-call-analytics */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/ai-controls/mcp/analytics/portals/${request.portal_id}/tool-calls/timeseries`,
	query: ["granularity", "aggregate", "tz", "days", "response_status"],
	errors: {
		400: "BadRequestError",
	},
} as const;
