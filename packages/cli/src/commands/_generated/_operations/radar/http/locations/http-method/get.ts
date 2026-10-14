/** @generated from radar.http.locations.http-method.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/http/top/locations/http_version/${request.http_version}`,
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
		"httpProtocol",
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
