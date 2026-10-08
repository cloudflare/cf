/** @generated from radar.http.locations.browser-family.get */
export default {
	method: "GET",
	path: "/radar/http/top/locations/browser_family/{browser_family}",
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
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
