/** @generated from radar.netflows.top.ases */
export default {
	method: "GET",
	path: () => "/radar/netflows/top/ases",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"geoId",
		"asCategory",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
