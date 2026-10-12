/** @generated from radar.attacks.layer3.top.locations.target */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer3/top/locations/target",
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
