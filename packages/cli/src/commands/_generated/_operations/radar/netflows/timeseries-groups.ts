/** @generated from radar-get-netflows-timeseries-group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/netflows/timeseries_groups/${request.dimension}`,
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"geoId",
		"limitPerGroup",
		"normalization",
		"product",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
