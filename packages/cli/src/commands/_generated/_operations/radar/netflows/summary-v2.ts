/** @generated from radar.netflows.summary-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/netflows/summary/${request.dimension}`,
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"geoId",
		"product",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
