/** @generated from radar-get-origins-timeseries */
export default {
	method: "GET",
	path: () => "/radar/origins/timeseries",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"origin",
		"metric",
		"region",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
