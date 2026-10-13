/** @generated from radar.ranking.timeseries-groups */
export default {
	method: "GET",
	path: () => "/radar/ranking/timeseries_groups",
	query: [
		"limit",
		"rankingType",
		"name",
		"location",
		"domains",
		"domainCategory",
		"dateRange",
		"dateStart",
		"dateEnd",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
