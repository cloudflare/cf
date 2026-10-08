/** @generated from radar.ai.bots.timeseries-groups */
export default {
	method: "GET",
	path: "/radar/ai/bots/timeseries_groups/{dimension}",
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
		"normalization",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
