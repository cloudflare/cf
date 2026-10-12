/** @generated from radar.bots.timeseries */
export default {
	method: "GET",
	path: () => "/radar/bots/timeseries",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
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
