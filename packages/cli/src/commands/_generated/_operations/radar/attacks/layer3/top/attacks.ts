/** @generated from radar-get-attacks-layer3-top-attacks */
export default {
	method: "GET",
	path: () => "/radar/attacks/layer3/top/attacks",
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
		"limitDirection",
		"limitPerLocation",
		"magnitude",
		"normalization",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
