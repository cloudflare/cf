/** @generated from radar.bots.summary */
export default {
	method: "GET",
	path: "/radar/bots/summary/{dimension}",
	query: [
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
