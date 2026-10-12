/** @generated from radar-get-attacks-layer3-timeseries-by-bytes */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer3/timeseries",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"ipVersion",
		"protocol",
		"normalization",
		"metric",
		"direction",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
