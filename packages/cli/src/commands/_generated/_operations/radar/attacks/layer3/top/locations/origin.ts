/** @generated from radar-get-attacks-layer3-top-origin-locations */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer3/top/locations/origin",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"ipVersion",
		"protocol",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
