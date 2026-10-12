/** @generated from radar-get-ai-inference-timeseries-group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/ai/inference/timeseries_groups/${request.dimension}`,
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"limitPerGroup",
		"normalization",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
