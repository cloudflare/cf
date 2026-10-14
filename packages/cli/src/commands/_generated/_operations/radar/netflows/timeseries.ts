/** @generated from radar.netflows.timeseries */
export default {
	method: "GET",
	path: () => "/radar/netflows/timeseries",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"product",
		"asn",
		"location",
		"continent",
		"geoId",
		"normalization",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
