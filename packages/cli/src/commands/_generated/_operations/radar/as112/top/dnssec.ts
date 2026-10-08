/** @generated from radar.as112.top.dnssec */
export default {
	method: "GET",
	path: "/radar/as112/top/locations/dnssec/{dnssec}",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
