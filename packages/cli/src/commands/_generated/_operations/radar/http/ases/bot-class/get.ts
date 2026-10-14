/** @generated from radar.http.ases.bot-class.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/http/top/ases/bot_class/${request.bot_class}`,
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
