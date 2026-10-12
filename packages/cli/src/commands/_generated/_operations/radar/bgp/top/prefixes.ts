/** @generated from radar.bgp.top.prefixes */
export default {
	method: "GET",
	path: () => "/radar/bgp/top/prefixes",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"updateType",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
