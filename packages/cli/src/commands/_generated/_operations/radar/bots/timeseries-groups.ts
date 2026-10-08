/** @generated from radar.bots.timeseries-groups */
export default {
	method: "GET",
	path: "/radar/bots/timeseries_groups/{dimension}",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"limitPerGroup",
		"bot",
		"botOperator",
		"botCategory",
		"botKind",
		"botVerificationStatus",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
