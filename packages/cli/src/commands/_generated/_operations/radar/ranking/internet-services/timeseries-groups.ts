/** @generated from radar.ranking.internet-services.timeseries-groups */
export default {
	method: "GET",
	path: () => "/radar/ranking/internet_services/timeseries_groups",
	query: [
		"serviceCategory",
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
