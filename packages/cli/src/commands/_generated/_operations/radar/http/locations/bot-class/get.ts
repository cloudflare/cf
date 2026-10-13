/** @generated from radar.http.locations.bot-class.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/http/top/locations/bot_class/${request.bot_class}`,
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
		"deviceType",
		"httpProtocol",
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
