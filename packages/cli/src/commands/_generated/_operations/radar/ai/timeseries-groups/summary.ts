/** @generated from radar.ai.timeseries-groups.summary */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/ai/bots/summary/${request.dimension}`,
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"crawlPurpose",
		"userAgent",
		"vertical",
		"industry",
		"contentType",
		"responseStatus",
		"responseStatusCategory",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
