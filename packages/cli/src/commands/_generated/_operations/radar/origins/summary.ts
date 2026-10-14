/** @generated from radar.origins.summary */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/origins/summary/${request.dimension}`,
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"origin",
		"metric",
		"region",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
