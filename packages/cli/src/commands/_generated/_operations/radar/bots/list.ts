/** @generated from radar.bots.list */
export default {
	method: "GET",
	path: () => "/radar/bots",
	query: [
		"limit",
		"offset",
		"botCategory",
		"botOperator",
		"kind",
		"botVerificationStatus",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
