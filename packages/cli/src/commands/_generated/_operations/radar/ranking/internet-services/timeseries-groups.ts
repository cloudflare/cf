/** @generated from radar-get-ranking-internet-services-timeseries */
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
