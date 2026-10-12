/** @generated from radar-get-ai-markdown-for-agents-summary */
export default {
	method: "GET",
	path: () => "/radar/ai/markdown_for_agents/summary",
	query: ["name", "dateRange", "dateStart", "dateEnd", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
