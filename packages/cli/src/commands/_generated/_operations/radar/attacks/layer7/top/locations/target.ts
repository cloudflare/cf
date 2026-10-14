/** @generated from radar.attacks.layer7.top.locations.target */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer7/top/locations/target",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"continent",
		"mitigationProduct",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
