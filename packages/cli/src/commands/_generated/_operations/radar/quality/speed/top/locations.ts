/** @generated from radar.quality.speed.top.locations */
export default {
	method: "GET",
	path: () => "/radar/quality/speed/top/locations",
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
