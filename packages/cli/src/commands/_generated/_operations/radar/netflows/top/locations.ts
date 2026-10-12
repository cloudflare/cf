/** @generated from radar-get-netflows-top-locations */
export default {
	method: "GET",
	path: () => "/radar/netflows/top/locations",
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
