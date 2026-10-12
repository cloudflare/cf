/** @generated from radar-get-http-top-locations-by-http-requests */
export default {
	method: "GET",
	path: () => "/radar/http/top/locations",
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
