/** @generated from radar.origins.timeseries-groups */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/origins/timeseries_groups/${request.dimension}`,
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"origin",
		"metric",
		"region",
		"normalization",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
