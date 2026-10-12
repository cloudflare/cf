/** @generated from radar-get-bots-timeseries-group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/bots/timeseries_groups/${request.dimension}`,
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
