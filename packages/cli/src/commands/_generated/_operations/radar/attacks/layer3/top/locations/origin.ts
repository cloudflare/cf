/** @generated from radar.attacks.layer3.top.locations.origin */
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
