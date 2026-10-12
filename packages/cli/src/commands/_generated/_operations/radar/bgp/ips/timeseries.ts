/** @generated from radar.bgp.ips.timeseries */
export default {
	method: "GET",
	path: () => "/radar/bgp/ips/timeseries",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"ipVersion",
		"includeDelay",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
