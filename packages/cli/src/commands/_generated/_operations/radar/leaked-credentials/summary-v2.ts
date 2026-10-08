/** @generated from radar.leaked-credentials.summary-v2 */
export default {
	method: "GET",
	path: "/radar/leaked_credential_checks/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"botClass",
		"compromised",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
