/** @generated from radar.origins.timeseries-groups */
export default {
	method: "GET",
	path: "/radar/origins/timeseries_groups/{dimension}",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"origin",
		"metric",
		"region",
		"normalization",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
