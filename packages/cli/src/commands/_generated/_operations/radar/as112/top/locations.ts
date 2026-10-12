/** @generated from radar-get-dns-as112-top-locations */
export default {
	method: "GET",
	path: () => "/radar/as112/top/locations",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
