/** @generated from radar.tlds.performance.timeseries-groups */
export default {
	method: "GET",
	path: "/radar/tlds/performance/timeseries_groups/{dimension}",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"tld",
		"nameserver",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
