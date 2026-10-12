/** @generated from radar-get-attacks-layer7-top-origin-location */
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
