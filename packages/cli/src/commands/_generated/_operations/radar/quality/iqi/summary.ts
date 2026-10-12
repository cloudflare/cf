/** @generated from radar.quality.iqi.summary */
export default {
	method: "GET",
	path: () => "/radar/quality/iqi/summary",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"metric",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
