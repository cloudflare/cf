/** @generated from radar-get-attacks-layer7-top-origin-as */
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
