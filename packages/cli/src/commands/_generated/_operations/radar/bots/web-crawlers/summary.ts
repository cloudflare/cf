/** @generated from radar-get-crawlers-summary */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/bots/crawlers/summary/${request.dimension}`,
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"botOperator",
		"vertical",
		"industry",
		"clientType",
		"responseStatus",
		"responseStatusCategory",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
