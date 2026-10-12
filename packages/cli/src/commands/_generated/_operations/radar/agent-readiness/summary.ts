/** @generated from radar-get-agent-readiness-summary */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/agent_readiness/summary/${request.dimension}`,
	query: ["date", "domainCategory", "name", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
