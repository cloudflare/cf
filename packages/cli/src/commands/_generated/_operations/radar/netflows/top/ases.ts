/** @generated from radar-get-netflows-top-ases */
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
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
