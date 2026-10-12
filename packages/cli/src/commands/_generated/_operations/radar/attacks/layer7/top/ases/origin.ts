/** @generated from radar.attacks.layer7.top.ases.origin */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer7/top/ases/origin",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"ipVersion",
		"httpVersion",
		"httpMethod",
		"mitigationProduct",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
