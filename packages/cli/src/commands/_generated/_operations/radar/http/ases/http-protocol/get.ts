/** @generated from radar-get-http-top-ases-by-http-protocol */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/http/top/ases/http_protocol/${request.http_protocol}`,
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"geoId",
		"botClass",
		"deviceType",
		"httpVersion",
		"ipVersion",
		"os",
		"tlsVersion",
		"browserFamily",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
