/** @generated from radar.bgp.top.ases.get */
export default {
	method: "GET",
	path: () => "/radar/bgp/top/ases",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"prefix",
		"updateType",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
