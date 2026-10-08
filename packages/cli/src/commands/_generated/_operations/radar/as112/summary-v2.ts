/** @generated from radar.as112.summary-v2 */
export default {
	method: "GET",
	path: "/radar/as112/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"queryType",
		"protocol",
		"responseCode",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
