/** @generated from radar.ai.markdown-for-agents.timeseries */
export default {
	method: "GET",
	path: () => "/radar/ai/markdown_for_agents/timeseries",
	query: ["aggInterval", "name", "dateRange", "dateStart", "dateEnd", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
