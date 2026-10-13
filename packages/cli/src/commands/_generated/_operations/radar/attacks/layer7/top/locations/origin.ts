/** @generated from radar.attacks.layer7.top.locations.origin */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer7/top/locations/origin",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
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
