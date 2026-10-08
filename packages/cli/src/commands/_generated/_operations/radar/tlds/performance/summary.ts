/** @generated from radar.tlds.performance.summary */
export default {
	method: "GET",
	path: "/radar/tlds/performance/summary/{dimension}",
	query: [
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
