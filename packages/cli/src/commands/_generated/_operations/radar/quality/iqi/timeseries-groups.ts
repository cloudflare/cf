/** @generated from radar.quality.iqi.timeseries-groups */
export default {
	method: "GET",
	path: () => "/radar/quality/iqi/timeseries_groups",
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"interpolation",
		"metric",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
