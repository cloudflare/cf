/** @generated from radar.netflows.summary-v2 */
export default {
	method: "GET",
	path: "/radar/netflows/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"geoId",
		"product",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
