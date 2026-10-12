/** @generated from radar-get-dns-timeseries-group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/dns/timeseries_groups/${request.dimension}`,
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"cacheHit",
		"nodata",
		"protocol",
		"queryType",
		"responseCode",
		"responseTtl",
		"dnssec",
		"dnssecAware",
		"dnssecE2e",
		"ipVersion",
		"limitPerGroup",
		"matchingAnswer",
		"tld",
		"normalization",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
