/** @generated from radar-get-http-timeseries-group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/http/timeseries_groups/${request.dimension}`,
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
		"apiTraffic",
		"botClass",
		"contentType",
		"limitPerGroup",
		"deviceType",
		"httpProtocol",
		"httpVersion",
		"normalization",
		"ipVersion",
		"os",
		"tlsVersion",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
