/** @generated from radar.attacks.layer3.summary-v2 */
export default {
	method: "GET",
	path: "/radar/attacks/layer3/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"ipVersion",
		"protocol",
		"direction",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
