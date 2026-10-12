/** @generated from radar-get-bots-summary */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/bots/summary/${request.dimension}`,
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"limitPerGroup",
		"bot",
		"botOperator",
		"botCategory",
		"botKind",
		"botVerificationStatus",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
