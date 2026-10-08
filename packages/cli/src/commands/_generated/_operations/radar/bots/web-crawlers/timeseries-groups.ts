/** @generated from radar.bots.web-crawlers.timeseries-groups */
export default {
	method: "GET",
	path: "/radar/bots/crawlers/timeseries_groups/{dimension}",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"normalization",
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
