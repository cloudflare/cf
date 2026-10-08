/** @generated from mcp.portals.account-tool-call-analytics */
export default {
	method: "GET",
	path: "/accounts/{account_id}/access/ai-controls/mcp/analytics/tool-calls/timeseries",
	query: ["granularity", "aggregate", "tz", "days"],
	errors: {
		400: "BadRequestError",
	},
} as const;
