/** @generated from radar.leaked-credentials.timeseries-groups-v2 */
export default {
	method: "GET",
	path: "/radar/leaked_credential_checks/timeseries_groups/{dimension}",
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
