/** @generated from radar.bgp.timeseries */
export default {
	method: "GET",
	path: () => "/radar/bgp/timeseries",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"prefix",
		"updateType",
		"asn",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
