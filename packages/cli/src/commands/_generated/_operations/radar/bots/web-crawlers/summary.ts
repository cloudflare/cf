/** @generated from radar.bots.web-crawlers.summary */
export default {
	method: "GET",
	path: "/radar/bots/crawlers/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"botOperator",
		"vertical",
		"industry",
		"clientType",
		"responseStatus",
		"responseStatusCategory",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
