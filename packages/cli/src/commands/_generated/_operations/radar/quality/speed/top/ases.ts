/** @generated from radar.quality.speed.top.ases */
export default {
	method: "GET",
	path: () => "/radar/quality/speed/top/ases",
	query: [
		"limit",
		"name",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"orderBy",
		"reverse",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
