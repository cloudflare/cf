/** @generated from radar-get-attacks-layer7-timeseries */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer7/timeseries",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"normalization",
		"ipVersion",
		"httpVersion",
		"httpMethod",
		"mitigationProduct",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
