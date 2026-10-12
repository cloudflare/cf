/** @generated from radar-get-crawlers-timeseries-group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/bots/crawlers/timeseries_groups/${request.dimension}`,
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"normalization",
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
