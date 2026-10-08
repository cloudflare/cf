/** @generated from radar.ai.timeseries-groups.summary */
export default {
	method: "GET",
	path: "/radar/ai/bots/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"crawlPurpose",
		"userAgent",
		"vertical",
		"industry",
		"contentType",
		"responseStatus",
		"responseStatusCategory",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
