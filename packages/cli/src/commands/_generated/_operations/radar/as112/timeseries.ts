/** @generated from radar-get-dns-as112-timeseries */
export default {
	method: "GET",
	path: () => "/radar/as112/timeseries",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"queryType",
		"protocol",
		"responseCode",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
