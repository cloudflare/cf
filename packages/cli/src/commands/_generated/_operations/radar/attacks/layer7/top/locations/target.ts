/** @generated from radar-get-attacks-layer7-top-target-location */
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
