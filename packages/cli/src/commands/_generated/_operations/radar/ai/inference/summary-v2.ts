/** @generated from radar.ai.inference.summary-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/ai/inference/summary/${request.dimension}`,
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
