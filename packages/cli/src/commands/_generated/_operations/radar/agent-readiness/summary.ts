/** @generated from radar.agent-readiness.summary */
export default {
	method: "GET",
	path: "/radar/agent_readiness/summary/{dimension}",
	query: ["date", "domainCategory", "name", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
