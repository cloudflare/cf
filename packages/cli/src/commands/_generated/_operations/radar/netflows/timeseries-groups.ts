/** @generated from radar.netflows.timeseries-groups */
export default {
	method: "GET",
	path: "/radar/netflows/timeseries_groups/{dimension}",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"geoId",
		"limitPerGroup",
		"normalization",
		"product",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
