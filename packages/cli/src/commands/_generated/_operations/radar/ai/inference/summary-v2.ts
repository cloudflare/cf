/** @generated from radar.ai.inference.summary-v2 */
export default {
	method: "GET",
	path: "/radar/ai/inference/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
