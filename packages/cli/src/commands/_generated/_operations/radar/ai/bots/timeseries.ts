/** @generated from radar.ai.bots.timeseries */
export default {
	method: "GET",
	path: () => "/radar/ai/bots/timeseries",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"crawlPurpose",
		"userAgent",
		"industry",
		"vertical",
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
