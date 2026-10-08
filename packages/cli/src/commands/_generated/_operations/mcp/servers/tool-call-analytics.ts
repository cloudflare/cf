/** @generated from mcp.servers.tool-call-analytics */
export default {
	method: "GET",
	path: "/accounts/{account_id}/access/ai-controls/mcp/analytics/servers/{server_id}/tool-calls/timeseries",
	query: ["granularity", "aggregate", "tz", "days"],
	errors: {
		400: "BadRequestError",
	},
} as const;
