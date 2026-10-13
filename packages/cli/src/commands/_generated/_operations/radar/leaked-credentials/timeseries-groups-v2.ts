/** @generated from radar.leaked-credentials.timeseries-groups-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/leaked_credential_checks/timeseries_groups/${request.dimension}`,
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"botClass",
		"compromised",
		"checkResult",
		"limitPerGroup",
		"normalization",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
