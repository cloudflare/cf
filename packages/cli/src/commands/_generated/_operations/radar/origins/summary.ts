/** @generated from radar.origins.summary */
export default {
	method: "GET",
	path: "/radar/origins/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"origin",
		"metric",
		"region",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
