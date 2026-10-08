/** @generated from radar.as112.top.ip-version */
export default {
	method: "GET",
	path: "/radar/as112/top/locations/ip_version/{ip_version}",
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
