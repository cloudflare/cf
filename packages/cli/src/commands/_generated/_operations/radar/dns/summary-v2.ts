/** @generated from radar.dns.summary-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/dns/summary/${request.dimension}`,
	query: [
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
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
