/** @generated from radar.quality.speed.histogram */
export default {
	method: "GET",
	path: () => "/radar/quality/speed/histogram",
	query: [
		"name",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"bucketSize",
		"metricGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
