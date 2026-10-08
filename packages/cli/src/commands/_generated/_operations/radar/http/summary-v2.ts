/** @generated from radar.http.summary-v2 */
export default {
	method: "GET",
	path: "/radar/http/summary/{dimension}",
	query: [
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
		"deviceType",
		"httpProtocol",
		"httpVersion",
		"ipVersion",
		"os",
		"tlsVersion",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
