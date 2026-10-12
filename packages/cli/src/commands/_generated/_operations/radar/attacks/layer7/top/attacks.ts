/** @generated from radar.attacks.layer7.top.attacks */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer7/top/attacks",
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"mitigationProduct",
		"limitDirection",
		"limitPerLocation",
		"normalization",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
